export const processInput = (urlStatus) => {
  const processors = {
    invalid: (inputElement, buttonElement) => {
      buttonElement.classList.toggle('disabled', true);
      inputElement.classList.toggle('border-succes', false);
      inputElement.classList.add('border-danger');
    },
    valid: (inputElement, buttonElement) => {
      buttonElement.classList.toggle('disabled', false);
      inputElement.classList.toggle('border-danger', false);
      inputElement.classList.add('border-success');
    },
    init: (inputElement, buttonElement) => {
      buttonElement.classList.toggle('disabled', true);
      inputElement.classList.toggle('border-danger', false);
      inputElement.classList.toggle('border-success', false);
    },
  };

  return processors[urlStatus];
};

export const makeAlert = ({ message, className }) => {
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
  button.dataset.target = `#${modalId}`;
  const textNode = document.createTextNode('description');
  button.append(textNode);

  return button;
};

export const createModalElement = (title, description) => {
  const modalBody = document.createElement('div');
  modalBody.classList.add('modal-body');
  modalBody.append(document.createTextNode(description));

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
  modal.id = title;
  modal.setAttribute('tab-index', '-1');
  modal.setAttribute('aria-labelledby', `${title}Label`);
  modal.setAttribute('aria-hidden', 'true');
  modal.append(modalDialog);

  return modal;
};
