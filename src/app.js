import validator from 'validator';
import { watch } from 'melanke-watchjs';
import axios from 'axios';
import _ from 'lodash';
import * as view from './view';
import parse from './parser';

export default () => {
  const state = {
    inputStatus: 'init',
    channels: {},
    feedLinks: [],
    alert: null,
    previousActiveModal: null,
    currentActiveModal: null,
    renderType: null,
  };

  const input = document.querySelector('input');
  const button = document.getElementById('searchButton');
  const renderedItems = {};

  const getFeed = (link, loadingType) => {
    const methods = {
      channelInit: {
        proccessData: (feedItems, name, description) => {
          state.channels = { ...state.channels, [name]: { feedItems, description } };
        },
        proccessState: (url) => {
          state.inputStatus = 'init';
          state.alert = null;
          state.feedLinks.push(url);
        },
        proccessRenderigHistory: (name) => {
          renderedItems[name] = [];
        },
      },
      channelUpdate: {
        proccessData: (items, name) => {
          const newFeedItems = items.filter(({ title }) => {
            const oldItems = state.channels[name].feedItems;
            const newItem = _.find(oldItems, i => title === i.title);
            return !newItem;
          });
          state.channels[name].feedItems = [...newFeedItems, ...state.channels[name].feedItems];
        },
        proccessState: () => {},
        proccessRenderigHistory: () => {},
      },
    };

    axios(`https://cors-anywhere.herokuapp.com/${link}`)
      .then((response) => {
        try {
          const {
            proccessState, proccessData, proccessRenderigHistory,
          } = methods[loadingType];
          const { channelName, content: { feedItems, description } } = parse(response.data);
          proccessState(link);

          proccessData(feedItems, channelName, description);
          proccessRenderigHistory(channelName);
          state.renderType = loadingType;
          setTimeout(() => getFeed(link, 'channelUpdate'), 5000);
        } catch (error) {
          state.inputStatus = 'init';
          state.alert = error.message;
        }
      });
  };

  input.addEventListener('input', ({ target: { value } }) => {
    const statusDispatch = [
      {
        check: inputValue => inputValue === '',
        currentStatus: 'init',
      },
      {
        check: inputValue => validator.isURL(inputValue),
        currentStatus: 'urlValid',
      },
      {
        check: inputValue => !validator.isURL(inputValue),
        currentStatus: 'urlInvalid',
      },
    ];

    state.inputStatus = _.find(statusDispatch, element => element.check(value)).currentStatus;
  });

  button.addEventListener('click', () => {
    if (state.inputStatus !== 'urlValid') {
      return;
    }

    const currentURL = input.value;
    if (state.feedLinks.includes(currentURL)) {
      state.alert = 'URLDouble';
      return;
    }
    state.inputStatus = 'loading';
    state.alert = 'loading';

    getFeed(currentURL, 'channelInit');
  });

  watch(state, 'inputStatus', () => view.processInput(state.inputStatus)(input, button));

  watch(state, 'alert', () => {
    const currentAlert = document.getElementById('alert');

    if (currentAlert) {
      currentAlert.remove();
    }

    if (!state.alert) {
      return;
    }

    const alertTypesData = {
      URLDouble: {
        message: 'Seems like you already have chis channel',
        className: 'alert-danger',
        processInput: inputField => inputField.select(),
      },
      loading: {
        message: 'Loading RSS-feed',
        className: 'alert-success',
        processInput: () => {},
      },
      notRSS: {
        message: 'Sorry, but this url is not RSS',
        className: 'alert-danger',
        processInput: inputField => inputField.select(),
      },
    };

    const {
      processInput, message, className,
    } = alertTypesData[state.alert];

    processInput(input);
    const alert = view.makeAlert(message, className);
    const alertCol = document.createElement('div');
    alertCol.classList.add('col');
    alertCol.append(alert);

    const alertRow = document.createElement('div');
    alertRow.append(alertCol);
    alertRow.classList.add('row', 'justify-content-center');
    alertRow.id = 'alert';
    document.getElementById('search-row').after(alertRow);
  });

  watch(state, 'channels', () => {
    const feedUl = document.getElementById('feed') || view.createFeedUl();

    const methods = {
      channelInit: {
        getChannel: (channelName, feed) => {
          const channel = view.createChannel(channelName, feed);
          feedUl.prepend(channel);
          return channel;
        },
        updateInput: () => {
          input.value = '';
        },
      },
      channelUpdate: {
        getChannel: (channelName, feed) => {
          document.getElementById(channelName).remove();
          const channel = view.createChannel(channelName, feed);
          feedUl.prepend(channel);
          return channel;
        },
        updateInput: () => {},
      },
    };
    const { getChannel, updateInput } = methods[state.renderType];

    updateInput();

    _.keys(state.channels).forEach((channelName) => {
      const feed = state.channels[channelName];

      const channel = getChannel(channelName, feed);

      const feedList = document.createElement('ul');
      feedList.classList.add('list-group');
      channel.append(feedList);

      feed.feedItems.forEach(({ title, link, itemDescription }) => {
        const aEl = document.createElement('a');
        aEl.href = link;
        aEl.append(document.createTextNode(title));
        const aCol = document.createElement('div');
        aCol.classList.add('col');
        aCol.append(aEl);

        const modal = view.createModalElement(title, itemDescription);
        modal.querySelector('.close').addEventListener('click', () => {
          state.previousActiveModal = state.currentActiveModal;
          state.currentActiveModal = null;
        });

        const descriptionButton = view.createDescriptionButton(title, state);
        descriptionButton.addEventListener('click', ({ target }) => {
          state.currentActiveModal = target.dataset.target;
        });

        const descriptionButtonCol = document.createElement('div');
        descriptionButtonCol.classList.add('col-sm-2');
        descriptionButtonCol.append(descriptionButton);

        const row = document.createElement('div');
        row.classList.add('row', 'container-fluid');
        row.append(aCol);
        row.append(descriptionButtonCol);
        const li = document.createElement('li');
        li.classList.add('list-group-item');
        li.append(row);
        li.append(modal);
        li.id = title;
        feedList.append(li);
      });
    });
  });

  watch(state, 'currentActiveModal', () => {
    if (!state.currentActiveModal) {
      const modalToClose = document.getElementById(state.previousActiveModal.slice(1));
      modalToClose.classList.remove('show');
      modalToClose.setAttribute('aria-hidden', 'true');
      modalToClose.removeAttribute('style');

      document.querySelector('.modal-backdrop').remove();
      document.body.classList.remove('modal-open');
      return;
    }

    const modalToShow = document.getElementById(state.currentActiveModal.slice(1));
    modalToShow.classList.add('show');
    modalToShow.removeAttribute('aria-hidden');
    modalToShow.setAttribute('style', 'display: block');

    const modalBackdrop = document.createElement('div');
    modalBackdrop.classList.add('modal-backdrop', 'fade', 'show');

    document.body.classList.add('modal-open');
    document.body.append(modalBackdrop);
  });
};
