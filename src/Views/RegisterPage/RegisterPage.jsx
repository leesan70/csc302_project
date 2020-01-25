import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';

import { UserActions } from 'Actions';

import {
    Grid,
    Typography,
    FormControl,
    FormLabel,
    FormControlLabel,
    TextField,
    Card,
    CardContent,
    Button,
    Input,
    FormHelperText
} from '@material-ui/core';

const validateEmail = email => {
    if (!email) {
        return 'Email is required';
    }
    if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email)) {
      return 'Invalid email address';
    }
    return null;
}

const validateUsername = username => {
    if (!username) {
        return 'Username is required';
    }
    if (username.length < 2) {
        return 'Username must be between 2 to 30 chars';
    }
    return null;
}

const validatePassword = password => {
    if (!password) {
        return 'Password is required';
    }
    if (password.length < 6) {
        return 'Password must have at least 6 chars';
    }
    return null;
}

const validatePasswordConfirm = (password, passwordConfirm) => {
    if (!passwordConfirm) {
        return 'Password Confirm is required';
    }
    if (password !== passwordConfirm) {
        return 'Password and Password Confirm does not match';
    }
    return null;
}

const validateInput = user => {
    const {
        email,
        username,
        password,
        password_confirm,
    } = user;
    return validateEmail(email) === null &&
        validatePassword(password) === null &&
        validateUsername(username) === null &&
        validatePasswordConfirm(password, password_confirm) === null;
}

class RegisterPage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            user: {
                username: '',
                email: '',
                password: '',
                password_confirm: ''
            },
            submitted: false
        };

        this.emailRef = React.createRef();
        this.passwordRef = React.createRef();
        this.passwordConfirmRef = React.createRef();

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(event) {
        const { name, value } = event.target;
        const { user } = this.state;
        this.setState({
            user: {
                ...user,
                [name]: value
            }
        });
        event.preventDefault();
    }

    handleSubmit(event) {
        event.preventDefault();

        this.setState({ submitted: true });
        const { user } = this.state;
        if (validateInput(user)) {
            this.props.register(user);
        } else {
            // do some alert
        }
    }

    render() {
        const { registering  } = this.props;
        const { user, submitted } = this.state;
        return (
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%'}}>
            <Card style={{width: '50%', margin: 'auto', paddingTop: 10}} raised={true}>
                <CardContent>
                    <Grid style={{width: '100%'}}>
                        <Typography variant="h2" style={{marginBottom: 20}}>Register</Typography>
                        <form name="form" onSubmit={this.handleSubmit}>
                            <FormControl style={{marginTop: 10, width: '100%'}}>
                                <FormLabel required={true} component="label" style={{color: 'black'}} htmlFor={"name"}>
                                    <Typography variant="h5" style={{display: 'inline-block'}}><b>Username</b></Typography>
                                </FormLabel>
                                <FormControlLabel
                                    style={{margin: 'auto', width: '100%'}}
                                    control={
                                        <TextField
                                            color="primary"
                                            style={{margin: 'auto', width: '100%'}}
                                            inputProps={{
                                                style: {fontSize: 15}
                                            }}
                                            type={"text"}
                                            name={"username"}
                                            onKeyPress={(e) => {
                                                if (e.key === "Enter") {
                                                    this.emailRef.current.focus();
                                                }
                                            }}
                                            onChange={this.handleChange}
                                            error={submitted && validateUsername(user.username) !== null}
                                            helperText={submitted && validateUsername(user.username)}
                                            value={user.username}
                                        />
                                    }
                                />
                            </FormControl>
                            
                            <FormControl style={{marginTop: 10, width: '100%'}}>
                                <FormLabel required={true} component="label" style={{color: 'black'}} htmlFor={"email"}>
                                    <Typography variant="h5" style={{display: 'inline-block'}}><b>Email</b></Typography>
                                </FormLabel>
                                <FormControlLabel
                                    style={{margin: 'auto', width: '100%'}}
                                    control={
                                        <TextField
                                            inputRef={this.emailRef}
                                            color="primary"
                                            style={{margin: 'auto', width: '100%'}}
                                            inputProps={{
                                                style: {fontSize: 15}
                                            }}
                                            type={"email"}
                                            name={"email"}
                                            onKeyPress={(e) => {
                                                if (e.key === "Enter") {
                                                    this.passwordRef.current.focus();
                                                }
                                            }}
                                            onChange={this.handleChange}
                                            error={submitted && validateEmail(user.email) !== null}
                                            helperText={submitted && validateEmail(user.email)}
                                            value={user.email}
                                        />
                                    }
                                />
                            </FormControl>

                            <FormControl style={{marginTop: 10, width: '100%'}}>
                                <FormLabel required={true} component="label" style={{color: 'black'}} htmlFor={"password"}>
                                    <Typography variant="h5" style={{display: 'inline-block'}}><b>Password</b></Typography>
                                </FormLabel>
                                <FormControlLabel
                                    style={{margin: 'auto', width: '100%'}}
                                    control={
                                        <TextField
                                            inputRef={this.passwordRef}
                                            color="primary"
                                            style={{margin: 'auto', width: '100%'}}
                                            inputProps={{
                                                style: {fontSize: 15}
                                            }}
                                            type={"password"}
                                            name={"password"}
                                            onKeyPress={(e) => {
                                                if (e.key === "Enter") {
                                                    this.passwordConfirmRef.current.focus();
                                                }
                                            }}
                                            onChange={this.handleChange}
                                            error={submitted && validatePassword(user.password) !== null}
                                            helperText={submitted && validatePassword(user.password)}
                                            value={user.password}
                                        />
                                    }
                                />
                            </FormControl>

                            <FormControl style={{marginTop: 10, width: '100%'}}>
                                <FormLabel required={true} component="label" style={{color: 'black'}} htmlFor={"password_confirm"}>
                                    <Typography variant="h5" style={{display: 'inline-block'}}><b>Password Confirm</b></Typography>
                                </FormLabel>
                                <FormControlLabel
                                    style={{margin: 'auto', width: '100%'}}
                                    control={
                                        <TextField
                                            inputRef={this.passwordConfirmRef}
                                            color="primary"
                                            style={{margin: 'auto', width: '100%'}}
                                            inputProps={{
                                                style: {fontSize: 15}
                                            }}
                                            type={"password"}
                                            name={"password_confirm"}
                                            onKeyPress={(e) => {
                                                if (e.key === "Enter") {
                                                    this.handleSubmit(e);
                                                }
                                            }}
                                            onChange={this.handleChange}
                                            error={submitted && validatePasswordConfirm(user.password, user.password_confirm) !== null}
                                            helperText={submitted && validatePasswordConfirm(user.password, user.password_confirm)}
                                            value={user.password_confirm}
                                        />
                                    }
                                />
                            </FormControl>
                        </form>
                    </Grid>
                    <Grid style={{marginTop: 20}}>
                        <Button
                            variant="contained"
                            color="primary"
                            style={{width: '25%', marginRight: 20, height: 30}}
                            type="button"
                            onClick={this.handleSubmit}>
                            Register
                        </Button>
                        <Link to="/form" style={{ textDecoration: 'none' }}>
                            <Button
                                variant="outlined"
                                color="secondary"
                                type="button"
                                style={{width: '25%', height: 30}}>
                                Cancel
                            </Button>
                        </Link>
                    </Grid>
                </CardContent>
            </Card>
            </div>
        );
    }
}

function mapState(state) {
    const { registering } = state.registration;
    return { registering };
}

const actionCreators = {
    register: UserActions.register
}

const connectedRegisterPage = connect(mapState, actionCreators)(RegisterPage);
export { connectedRegisterPage as RegisterPage };