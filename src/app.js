import validator from 'validator';
import { watch } from 'melanke-watchjs';
import axios from 'axios';
import _ from 'lodash';
import * as utils from './utils';

export default () => {
  const state = {
    alert: null,
    urlStatus: 'init',
    channels: {},
    feedLinks: [],
    previousActiveModal: null,
    currentActiveModal: null,
    renderType: null,
  };

  const input = document.querySelector('input');
  const button = document.querySelector('button');

  input.addEventListener('input', ({ target: { value } }) => {
    if (value === '') {
      state.urlStatus = 'init';
    } else {
      state.urlStatus = validator.isURL(value) ? 'valid' : 'invalid';
    }
  });

  button.addEventListener('click', () => {
    if (!state.urlStatus === 'valid') {
      return;
    }
    const currentURL = input.value;
    if (state.feedLinks.includes(currentURL)) {
      state.urlStatus = 'init';
      state.alert = 'URLDouble';
      input.select();
      return;
    }

    state.feedLinks.push(currentURL);
    state.alert = 'loading';

    axios(`https://cors-anywhere.herokuapp.com/${currentURL}`)
      .then((response) => {
        state.urlStatus = 'init';
        state.alert = null;
        return response;
      })
      .then((response) => {
        const parser = new DOMParser();
        const feed = parser.parseFromString(response.data, 'application/xml');
        const channelName = feed.querySelector('channel > title').textContent;
        const description = feed.querySelector('description');
        const feedItems = [...feed.querySelectorAll('item')].map(item => ({
          title: item.querySelector('title').textContent,
          itemDescription: item.querySelector('description').textContent,
          link: item.querySelector('link').textContent,
        }));
        state.channels = { ...state.channels, [channelName]: { feedItems, description } };
        state.renderType = 'listInit';
      });
  });

  watch(state, 'urlStatus', () => {
    utils.processInput(state.urlStatus)(input, button);
  });

  watch(state, 'alert', () => {
    const currentAlert = document.getElementById('alert');

    if (currentAlert) {
      currentAlert.remove();
    }

    if (!state.alert) {
      return;
    }

    const types = {
      URLDouble: {
        message: 'Seems like you already have chis channel',
        className: 'alert-danger',
      },
      loading: {
        message: 'Loading RSS-feed',
        className: 'alert-success',
      },
    };

    const alert = utils.makeAlert(types[state.alert]);
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
//    input.value = '';
    const feedUl = document.getElementById('feed') || utils.createFeedUl();
    const methods = {
      listInit: {
        getChannel: (channelName, feed) => {
          if (document.getElementById(channelName)) {
            return null;
          }
          const channel = utils.createChannel(channelName, feed);
          feedUl.prepend(channel);
          return channel;
        },
        getFeedList: (channelName) => {
          const feedList = document.createElement('ul');
          feedList.classList.add('list-group');
          document.getElementById(channelName).append(feedList);
          return feedList;
        },
        insert: (parent, child) => parent.append(child),
        updateInput: () => {
          input.value = '';
        },
      },
      listUpdate: {
        getChannel: channelName => document.getElementById(channelName),
        getFeedList: channelName => document.getElementById(channelName).querySelector('ul'),
        insert: (parent, child) => parent.prepend(child),
        updateInput: () => {},
      },
    };

    methods[state.renderType].updateInput();
    _.keys(state.channels).forEach((channelName) => {
      const feed = state.channels[channelName];
      methods[state.renderType].getChannel(channelName, feed);

      const feedList = methods[state.renderType].getFeedList(channelName);

      feed.feedItems.forEach(({ title, link, itemDescription }) => {
        if (document.getElementById(title)) {
          return;
        }
        const aEl = document.createElement('a');
        aEl.href = link;
        aEl.append(document.createTextNode(title));
        const aCol = document.createElement('div');
        aCol.classList.add('col');
        aCol.append(aEl);

        const modal = utils.createModalElement(title, itemDescription);
        modal.querySelector('.close').addEventListener('click', () => {
          state.previousActiveModal = state.currentActiveModal;
          state.currentActiveModal = null;
        });

        const descriptionButton = utils.createDescriptionButton(title, state);
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
        methods[state.renderType].insert(feedList, li);
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

  const checkForUpdates = () => {
    state.feedLinks.forEach((link) => {
      axios(`https://cors-anywhere.herokuapp.com/${link}`)
        .then((response) => {
          const parser = new DOMParser();
          const feed = parser.parseFromString(response.data, 'application/xml');
          const channelName = feed.querySelector('channel > title').textContent;
          const newFeedItems = [...feed.querySelectorAll('item')]
            .filter((item) => {
              const title = item.querySelector('title').textContent;
              const oldItems = state.channels[channelName].feedItems;
              const newItem = _.find(oldItems, i => title === i.title);
              return !newItem;
            });

          if (newFeedItems.length > 0) {
            newFeedItems.forEach((item) => {
              const processedItem = {
                title: item.querySelector('title').textContent,
                itemDescription: item.querySelector('description').textContent,
                link: item.querySelector('link').textContent,
              };
              state.channels[channelName].feedItems.push(processedItem);
            });
            state.renderType = 'listUpdate';
          }
        });
    });
  };

  setInterval(checkForUpdates, 5000);
};
