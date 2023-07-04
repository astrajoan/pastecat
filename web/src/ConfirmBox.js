import React from 'react';

import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';

const confirmButtons = (yesMsg, onClose, noMsg, yesOp) => {
  if (yesMsg && noMsg) {
    const closeAndMakeOp = () => {
      onClose();
      yesOp();
    };
    return (
      <div>
        <button className="custom-ui-button" onClick={closeAndMakeOp}>
          {yesMsg}
        </button>
        <button className="custom-ui-button" onClick={onClose}>
          {noMsg}
        </button>
      </div>
    );
  } else {
    return (
      <div>
        <button className="custom-ui-button" onClick={onClose}>
          {yesMsg}
        </button>
      </div>
    );
  }
};

const confirmBox = (confirmTitle, confirmMsg, yesMsg, noMsg, yesOp) => {
  confirmAlert({
    customUI: ({ onClose }) => {
      return (
        <div className='custom-ui'>
          <h1>{confirmTitle}</h1>
          <p>{confirmMsg}</p>
          {confirmButtons(yesMsg, onClose, noMsg, yesOp)}
        </div>
      );
    },
    closeOnEscape: true,
    closeOnClickOutside: false,
    overlayClassName: "react-confirm-alert-overlay"
  });
};

export const alertBox = (alertTitle, alertMsg) => {
  confirmBox(alertTitle, alertMsg, "Ok");
};

export const choiceBox = (choiceTitle, choiceMsg, yesOp) => {
  confirmBox(choiceTitle, choiceMsg, "Yes", "No", yesOp);
};
