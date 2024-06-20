export const displaySuccessMessage = (message) => {
    const messageBox = document.createElement('div');
    messageBox.textContent = message;
    messageBox.className = 'success-message';
    document.body.appendChild(messageBox);
  
    setTimeout(() => {
      messageBox.classList.add('hide');
      setTimeout(() => {
        document.body.removeChild(messageBox);
      }, 500); // Match the CSS transition duration
    }, 3000); // Message display duration (3 seconds)
  };
  