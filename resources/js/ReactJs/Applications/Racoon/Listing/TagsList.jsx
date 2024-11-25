import { ActionList, Button, Popover } from '@shopify/polaris';
import { useState } from 'react';
import eyeicon from '../Assets/images/racoon-eye.svg';
function TagsList({restriction_tags}) {
  const [popoverActive, setPopoverActive] = useState(false);

  const tags = restriction_tags.map(restriction_tag => restriction_tag.tag);

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
        items={tags.map(tag => ({
          content: tag,
          onAction: () => console.log(`Clicked on ${tag}`), // Define action for each tag
        }))}
      />
    </Popover>
  );
}

export default TagsList;
