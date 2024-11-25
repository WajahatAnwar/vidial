import { Head } from '@inertiajs/react';
import { Box, Button, TextField } from '@mui/material';
import { Container, Grid, Typography, useMediaQuery, useTheme } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { InputAdornment, IconButton } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import '@/ReactJs/MyApplication/Assets/css/styleTwo.css';
import ToggleLogin from '@/ReactJs/Components/ToggleLogin';
import { router } from '@inertiajs/react';
import React, { useState } from 'react';
import Swal from 'sweetalert2';

export default function Register() {

    const [showPassword, setShowPassword] = React.useState(false);
    const handleClickShowPassword = () => {
        setShowPassword((prevShowPassword) => !prevShowPassword);
    };

    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };

    const theme = createTheme({
        palette: {
            neutral: {
                main: '#64748B',
                contrastText: '#fff',
            },
            lastButton: {
                main: '#323232',
                contrastText: '#fff',
            },
        },
    });

    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [checked, setChecked] = useState(false);

    async function loginHandler(event) {
        event.preventDefault();
        let formData = new FormData();

        formData.append("email", email);
        formData.append("password", password);
        formData.append("remember_me", checked);

        let data = await fetch(route('login.post'), {
            method: 'POST',
            body: formData
        });
        let response = await data.json();
        if (response.success) {
            router.get(route('index'))
        } else {

            Swal.fire(
                'Error!',
                response.message,
                'error'
            );
        }
    }

    return (
        <ThemeProvider theme={theme}>

            <Container maxWidth={false} sx={{ padding: '0 !important', margin: '0 !important', height: '100vh' }}>
                <Head title='Login'></Head>
                <Grid container justifyContent="center" sx={{ height: '100%' }}>
                    <Grid item xs={isMobile ? 12 : 6} sx={{ backgroundColor: "#ffffff" }}>
                        <Box sx={{
                            position: 'absolute',
                            top: '15%',
                            width: `${isMobile ? '100%' : '50%'}`,
                        }}>
                            <Box sx={{
                                pl: { xs: '30px', sm: '40px', md: '120px', lg: '160px', xl: '190px' },
                                pr: { xs: '30px', sm: '40px', md: '120px', lg: '160px', xl: '190px' }
                            }}>

                                <Box>
                                    <img src={`${window.appURL}/images/logo.png`} alt="Login" style={{ display: "inline", marginLeft: "-8px", width: '105px', objectFit: 'fill' }} />
                                    <img src={`${window.appURL}/images/club_color_written.png`} alt="written_logo" style={{ marginLeft: "10px", display: "inline", height: '40px', objectFit: 'fill' }} />
                                </Box>

                                <Typography variant="h3" sx={{ fontSize: "40px", fontWeight: "700", color: "#1E293B", mt: 5 }}>
                                    Welcome back
                                </Typography>
                                <Box mt={1.5}></Box>
                                <Typography sx={{ fontSize: "18px", color: "#64748B" }}>
                                    Enter your email and password to sign in
                                </Typography>
                                <Box mt={5}></Box>
                                <TextField
                                    placeholder="e.g. john.doe@gmail.com"
                                    label="Email Address"
                                    variant="outlined"
                                    size="small"
                                    fullWidth
                                    InputLabelProps={{ shrink: true }}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                                <Box mt={3}></Box>
                                <TextField
                                    variant="outlined"
                                    size="small"
                                    type={showPassword ? 'text' : 'password'}
                                    label="Password"
                                    placeholder="8-10 Characters"
                                    fullWidth
                                    InputLabelProps={{ shrink: true }}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    aria-label="toggle password visibility"
                                                    onClick={handleClickShowPassword}
                                                    onMouseDown={handleMouseDownPassword}
                                                    edge="end"
                                                >
                                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <Box mt={3}></Box>
                                <Box sx={{ display: "flex" }}>
                                    {/* <Switch sx={{ ml: -1 }}
                                        checked={data.remember}
                                        onChange={(e) => setData('remember', e.target.checked)}
                                    /> */}

                                    <ToggleLogin
                                        toggled={checked}
                                        onClick={(e) => setChecked(e.target.checked)}
                                    />

                                    <Typography sx={{ fontSize: "14px", mt: 0.3, ml: 2 }}>
                                        Remember Me
                                    </Typography>
                                </Box>
                                <Box mt={5}></Box>
                                <Button fullWidth variant="contained" color="primary" onClick={loginHandler} sx={{ backgroundImage: "linear-gradient(to right, rgb(83, 136, 166) 0%, rgb(39, 54, 117) 100%)", fontFamily: "verdana" }}>Login</Button>
                            </Box>
                        </Box>
                    </Grid>
                    {!isMobile && (
                        <Grid item xs={6} sx={{ position: 'relative', backgroundColor: "#ffffff" }}>
                            <img src={`${window.appURL}/images/login_image.png`} alt="Login" style={{ width: '100%', height: '100%', objectFit: 'fill' }} />
                        </Grid>
                    )}
                </Grid>
            </Container>
        </ThemeProvider >
    );
}
