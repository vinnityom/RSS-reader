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
