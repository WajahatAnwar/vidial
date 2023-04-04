import {Page, Grid, Card, Button, TextField, Checkbox} from '@shopify/polaris';
import React, {useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './css/style.css';
function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [checked, setChecked] = useState(false);

    async function loginHandler(event){
        event.preventDefault();
        let formData = new FormData();

        formData.append("email",email);
        formData.append("password",password);
        formData.append("remember_me",checked);

        let data = await fetch('/login', {
            method: 'POST',
            body: formData
        });
        let response = await data.json();
        if (response.success) {
            navigate('/');
        } else {
            console.log(response.message);
        }
    }

  return (
    <Page>
      <Grid>
        <Grid.Cell columnSpan={{xs: 12, sm: 12, md: 4, lg: 4, xl: 4}}>

        </Grid.Cell>
        <Grid.Cell columnSpan={{xs: 4, sm: 12, md: 4, lg: 4, xl: 4}}>
          <div style={{marginTop:"130px"}}>
          <Card>
             <div style={{padding:"20px"}}>
                <TextField
            label=" Email Address"
            value={email}
            onChange={(e) => setEmail(e)}
            autoComplete="off"
            />
            <div style={{padding:"20px 0"}}>
                <TextField
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e)}
                autoComplete="off"
                />
            </div>
            <div style={{display:"flex",justifyContent:"space-between"}}>
              <Checkbox
                label="Remember Me"
                checked={checked}
                onChange={(e) => setChecked(e)}
                />
             <Button primary onClick={loginHandler}>Log In</Button>
            </div>
            </div>
          </Card>
          </div>
        </Grid.Cell>
        <Grid.Cell columnSpan={{xs: 12, sm: 12, md: 4, lg: 4, xl: 4}}>
          </Grid.Cell>
      </Grid>
    </Page>
  );
}
export default Login;
