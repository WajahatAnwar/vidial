import { ActionList, Button, Popover } from '@shopify/polaris';
import { useState } from 'react';
import eyeicon from '../Assets/images/racoon-eye.svg';
function EmailsList({restriction_emails}) {
  const [popoverActive, setPopoverActive] = useState(false);

  // Dummy email list for demonstration
  const emails = restriction_emails.map(restriction_email => restriction_email.email);

  const togglePopoverActive = () => {
    setPopoverActive((popoverActive) => !popoverActive);
  };

  const activator = (
    <Button
      plain
      onClick={togglePopoverActive}
      onMouseOver={() => setPopoverActive(true)}
      onFocus={() => setPopoverActive(true)}
      onBlur={() => setPopoverActive(false)}
    >
      <img src={eyeicon} />
    </Button>
  );

  return (
    <Popover
      active={popoverActive}
      activator={activator}
      onClose={togglePopoverActive}
      sectioned
    >
      <ActionList
        items={emails.map(email => ({
          content: email,
          onAction: () => console.log(`Clicked on ${email}`), // Define action for each email
        }))}
      />
    </Popover>
  );
}

export default EmailsList;
