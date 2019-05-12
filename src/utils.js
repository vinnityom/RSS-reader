export const processInput = (urlStatus) => {
  const processors = {
    init: (inputElement, buttonElement) => {
      buttonElement.classList.toggle('disabled', true);
      inputElement.classList.toggle('border-danger', false);
      inputElement.classList.toggle('border-success', false);
      inputElement.removeAttribute('disabled');
    },
    urlInvalid: (inputElement, buttonElement) => {
      buttonElement.classList.toggle('disabled', true);
      inputElement.classList.toggle('border-succes', false);
      inputElement.classList.add('border-danger');
    },
    urlValid: (inputElement, buttonElement) => {
      buttonElement.classList.toggle('disabled', false);
      inputElement.classList.toggle('border-danger', false);
      inputElement.classList.add('border-success');
    },
    loading: (inputElement, buttonElement) => {
      buttonElement.classList.toggle('disabled', true);
      inputElement.setAttribute('disabled', true);
    },
  };

  return processors[urlStatus];
};

export const parse = (data) => {
  const parser = new DOMParser();
  const feed = parser.parseFromString(data, 'application/xml').querySelector('rss');
  return feed;
};

export const processFeedItems = feedItems => feedItems.map(item => ({
  title: item.querySelector('title').textContent,
  itemDescription: item.querySelector('description').textContent,
  link: item.querySelector('link').textContent,
}));

export const makeAlert = (message, className) => {
  const textNode = document.createTextNode(message);
  const alertDiv = document.createElement('div');
  alertDiv.classList.add('alert', className);
  alertDiv.setAttribute('role', 'alert');
  alertDiv.append(textNode);

  return alertDiv;
};

export const createFeedUl = () => {
  const feedUl = document.createElement('ul');
  feedUl.classList.add('list-group');
  feedUl.id = 'feed';

  const feedField = document.createElement('div');
  feedField.classList.add('container');
  feedField.append(feedUl);

  document.body.append(feedField);
  return feedUl;
};

export const createDescriptionButton = (modalId) => {
  const button = document.createElement('button');
  button.classList.add('btn', 'btn-primary', 'btn-sm');
  button.dataset.toggle = 'modal';
  button.dataset.target = `#${modalId}Modal`;
  const textNode = document.createTextNode('description');
  button.append(textNode);

  return button;
};

export const createModalElement = (title, description) => {
  const modalBody = document.createElement('div');
  modalBody.classList.add('modal-body');
  modalBody.innerHTML = description;
  [...modalBody.querySelectorAll('img')].forEach((img) => {
    img.setAttribute('width', '100%');
  });

  const span = document.createElement('span');
  span.setAttribute('aria-hidden', 'true');
  span.append(document.createTextNode('×'));

  const button = document.createElement('button');
  button.setAttribute('type', 'button');
  button.classList.add('close');
  button.dataset.dismiss = 'modal';
  button.setAttribute('aria-label', 'Close');
  button.append(span);

  const headerElement = document.createElement('h5');
  headerElement.classList.add('modal-title');
  headerElement.id = `${title}Lable`;
  headerElement.append(document.createTextNode(title));

  const modalHeader = document.createElement('div');
  modalHeader.classList.add('modal-header');
  modalHeader.append(headerElement, button);

  const modalContent = document.createElement('div');
  modalContent.classList.add('modal-content');
  modalContent.append(modalHeader, modalBody);

  const modalDialog = document.createElement('div');
  modalDialog.classList.add('modal-dialog');
  modalDialog.setAttribute('role', 'document');
  modalDialog.append(modalContent);

  const modal = document.createElement('div');
  modal.classList.add('modal', 'fade');
  modal.id = `${title}Modal`;
  modal.setAttribute('tab-index', '-1');
  modal.setAttribute('aria-labelledby', `${title}Label`);
  modal.setAttribute('aria-hidden', 'true');
  modal.append(modalDialog);

  return modal;
};

export const createChannel = (name, feed) => {
  const channelNameNode = document.createTextNode(name);
  const pEl = document.createElement('p');
  pEl.append(channelNameNode);
  pEl.append(document.createElement('br'));

  const descriptionTextNode = document.createTextNode(feed.description.textContent);
  const smallTextElement = document.createElement('small');
  smallTextElement.append(descriptionTextNode);
  pEl.append(smallTextElement);

  const channelLi = document.createElement('li');
  channelLi.append(pEl);
  channelLi.classList.add('list-group-item');
  channelLi.id = name;

  return channelLi;
};
