import React, { useState, useEffect } from 'react';
import { Modal, Button } from '@mui/material';

const WalletInstallModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (typeof window.ethereum === 'undefined') {
      setIsOpen(true);
    }
  }, []);

  const closeModal = () => {
    setIsOpen(false);
  };

  return (
    <>
      <Modal open={isOpen} onClose={closeModal}>
        <div style={{ backgroundColor: 'white', padding: '1rem' }}>
          <h2>Please install Metamask</h2>
          <p>
            To use our app, you need to install Metamask. Click{' '}
            <a href="https://metamask.io/">here</a> to download and install it.
          </p>
          <Button variant="contained" onClick={closeModal}>
            Close
          </Button>
        </div>
      </Modal>
      {/* Your app content */}
    </>
  );
};

export default WalletInstallModal;