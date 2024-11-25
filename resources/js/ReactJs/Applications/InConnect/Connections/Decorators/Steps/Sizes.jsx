import AppLayout from '@/ReactJs/Applications/InConnect/AppLayout';
import '@/ReactJs/Applications/InConnect/Assets/css/style.css';
import { setDecorator } from '@/ReactJs/reducers/InConnect/DecoratorSlice';
import { usePage } from '@inertiajs/react';
import { Card, Grid, Page, Text, TextField } from '@shopify/polaris';
import { DeleteIcon } from "@shopify/polaris-icons";
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
// import Table from "./DecoratorsTable";
function Sizes() {
  const page = usePage().props;
  const { query } = page.ziggy;

  const dispatch = useDispatch();

  const decorator = useSelector(state => state.inConnectDecorator.decorator);

  const handleChange = (object) => {
    dispatch(setDecorator(object));
  }

  const handleAddSize = () => {
    let temp = [...decorator.sizes];
    temp.push({ name: '', shopify_sizes: [] });
    handleChange({ ...decorator, sizes: temp });
  };

  const animatedComponents = makeAnimated();

  const [sizeOptions, setSizeOptions] = useState([]);
  const [sizeOpts, setSizeOpts] = useState([]);

  useEffect(() => {
    fetchSizeOptions();
  }, []);

  const fetchSizeOptions = async () => {
    try {
      const response = await fetch(route('ic_options', 'size'), {
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
        setSizeOptions(options);
        var temp = options.filter((option) => {
          let values = decorator.sizes.map((size) => {
            return size.shopify_sizes.map((shopify_size) => {
              return shopify_size.value;
            });
          });
          values = [].concat.apply([], values);
          return !values.includes(option.value);
        });
        setSizeOpts(temp);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    let temp = [...sizeOptions];
    decorator.sizes.forEach((size) => {
      size.shopify_sizes.forEach((shopify_size) => {
        temp = temp.filter((option) => {
          return option.value != shopify_size.value;
        });
      });
    });
    setSizeOpts(temp);
  }, [decorator]);


  return (
    <div className='main-div mt-4 mb-4' >
      <Page >
        <Card>
          <Grid>
            <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 3, lg: 3, xl: 3 }}>
              <Text variant="headingMd" as="h6"> <span className='cust-staric'>Decorator Size</span></Text>
            </Grid.Cell>
            <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 9, lg: 9, xl: 9 }}>
              <Text variant="headingMd" as="h6" alignment='center'><span className='cust-staric'>Shopify Size</span>  </Text>
            </Grid.Cell>
          </Grid>
          <Grid>
            {decorator.sizes.map((value, index) => (
              <>
                <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 3, lg: 3, xl: 3 }}>
                  <div className='sizemodal-textfield mt-4'>
                    <TextField
                      value={value.name}
                      placeholder={`Size ${index + 1}`}
                      autoComplete="off"
                      onChange={(e) => {
                        let temp = [...decorator.sizes];
                        temp[index] = { ...temp[index], name: e };
                        handleChange({ ...decorator, sizes: temp });
                      }}
                    />
                  </div>
                </Grid.Cell>
                <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 9, lg: 9, xl: 9 }}>
                  <div className="sizemodal-dropdown mt-4 flex justify-between">
                    <Select
                      menuPortalTarget={document.body}
                      styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                      components={animatedComponents}
                      isMulti
                      options={sizeOpts}
                      value={value.shopify_sizes}
                      onChange={(e) => {
                        let temp = [...decorator.sizes];
                        temp[index] = { ...temp[index], shopify_sizes: e };
                        handleChange({ ...decorator, sizes: temp });
                      }}
                    />
                    <div style={{ marginLeft: "10px", marginTop: "7px" }}>
                      <span style={{ cursor: "pointer" }} onClick={() => {
                        let temp = [...decorator.sizes];
                        temp.splice(index, 1);
                        handleChange({ ...decorator, sizes: temp });
                      }}> <DeleteIcon width={20} /> </span>
                    </div>
                  </div>
                </Grid.Cell>
              </>
            ))}
          </Grid>
          <div className='flex justify-center mt-4'>
            <button className="btn-sizemodal" onClick={handleAddSize}>
              Add Size
            </button>
          </div>
        </Card>
      </Page>
    </div>
  );
}

Sizes.layout = (page) => <AppLayout children={page} auth={page.props.auth} />
export default Sizes;

