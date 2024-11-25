import AppLayout from '@/ReactJs/Applications/InConnect/AppLayout';
import '@/ReactJs/Applications/InConnect/Assets/css/style.css';
import { setDecorator } from '@/ReactJs/reducers/InConnect/DecoratorSlice';
import { usePage } from '@inertiajs/react';
import { Divider, Text } from '@shopify/polaris';
import { DeleteIcon } from "@shopify/polaris-icons";
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Select from 'react-select';

function Decorators() {
  const page = usePage().props;
  const { query } = page.ziggy;

  const dispatch = useDispatch();
  const decorator = useSelector(state => state.inConnectDecorator.decorator);

  const handleChange = (object) => {
    dispatch(setDecorator(object));
  }

  const handleAddPersonalization = () => {
    let temp = [...decorator.personalizations];
    temp.push('');
    handleChange({ ...decorator, personalizations: temp });
  };

  const [personalizationOptions, setPersonalizationOptions] = useState([]);

  useEffect(() => {
    fetchPersonalizationOptions();
  }, []);

  const fetchPersonalizationOptions = async () => {
    try {
      const response = await fetch(route('ic_options', 'frontend_name'), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      let data = await response.json();
      if (data.success) {
        const options = data.data.map((option) => {
          return {
            value: option.id,
            label: option.name,
          }
        });
        setPersonalizationOptions(options);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };


  return (
    <div className='logolocation-main-div mt-10 mb-4'>
      <div className="logo-locationOne mt-4">
        <div className="location-text">
          <Text variant="headingMd" as="h6">
            Personalization
          </Text>
          <Divider />
        </div>
        <div className='logo-location' style={{ padding: "25px" }}>
          <div className="personalization-text flex justify-around  ">
            <Text variant="headingMd" as="h6">
              Decorator Field
            </Text>
            <Text variant="headingMd" as="h6">
              Shopify Personalization Fields
            </Text>
          </div>
          {decorator.personalizations.map((value, index) => (
            <div key={index} className="personalization-textfield flex justify-around mt-4">
              <Text variant="headingMd" as="h6">
                Line {index + 1} color
              </Text>
              <div className='flex justify-between'>
                <div style={{ width: '175px' }}>
                  <Select
                    menuPortalTarget={document.body}
                    styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                    options={personalizationOptions}
                    value={value}
                    onChange={(e) => {
                      let temp = [...decorator.personalizations];
                      temp[index] = e;
                      handleChange({ ...decorator, personalizations: temp });
                    }}
                  />
                </div>
                <div style={{ marginLeft: "10px", marginTop: "7px" }}>
                  <span style={{ cursor: "pointer" }} onClick={() => {
                    let temp = [...decorator.personalization];
                    temp.splice(index, 1);
                    handleChange({ ...decorator, personalization: temp });
                  }} > <DeleteIcon width={20} /> </span>
                </div>
              </div>
            </div>
          ))}
          <div className='flex justify-center mt-4'>
            <button className="btn-personalization" onClick={handleAddPersonalization}>
              Add Phrase
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

Decorators.layout = (page) => <AppLayout children={page} auth={page.props.auth} />
export default Decorators;
