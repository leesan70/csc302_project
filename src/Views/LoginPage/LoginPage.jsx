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
    Input
} from '@material-ui/core';

const validateUsername = username => {
    if (!username) {
        return 'Username is required';
    }
    if (username.length < 2) {
        return 'Name must be between 2 to 30 chars';
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

const validateInput = user => {
    const {
        username,
        password,
    } = user;
    return validateUsername(username) === null &&
        validatePassword(password) === null;
}

class LoginPage extends React.Component {
    constructor(props) {
        super(props);

        // reset login status
        this.props.logout();

        this.state = {
            username: '',
            password: '',
            submitted: false
        };

        this.passwordRef = React.createRef();

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(e) {
        const { name, value } = e.target;
        this.setState({ [name]: value });
        e.preventDefault();
    }

    handleSubmit(e) {
        e.preventDefault();

        this.setState({ submitted: true });
        const { username, password } = this.state;
        if (validateInput({username, password})) {
            this.props.login(username, password);
        }
    }

    render() {
        const { loggingIn } = this.props;
        const { username, password, submitted } = this.state;
        return (
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%'}}>
            <Card style={{width: '50%', margin: 'auto', paddingTop: 10}} raised={true}>
                <CardContent>
                    <Grid style={{width: '100%'}}>
                        <Typography variant="h2" style={{marginBottom: 20}}>Login</Typography>
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
                                                    this.passwordRef.current.focus();
                                                }
                                            }}
                                            onChange={this.handleChange}
                                            error={submitted && validateUsername(username) !== null}
                                            helperText={submitted && validateUsername(username)}
                                            value={username}
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
                                                    this.handleSubmit(e);
                                                }
                                            }}
                                            onChange={this.handleChange}
                                            error={submitted && validatePassword(password) !== null}
                                            helperText={submitted && validatePassword(password)}
                                            value={password}
                                        />
                                    }
                                />
                            </FormControl>
                            <Grid style={{marginTop: 20}}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    style={{width: '25%', marginRight: 20, height: 30}}
                                    type="button"
                                    onClick={this.handleSubmit}>
                                    Login
                                </Button>
                                <Link to="/register" style={{ textDecoration: 'none' }}>
                                    <Button
                                        variant="outlined"
                                        color="secondary"
                                        type="button"
                                        style={{width: '25%', height: 30}}>
                                        Register
                                    </Button>
                                </Link>
                            </Grid>
                        </form>
                    </Grid>
                </CardContent>
            </Card>
            </div>
        );
    }
}

function mapState(state) {
    const { loggingIn } = state.authentication;
    return { loggingIn };
}

const actionCreators = {
    login: UserActions.login,
    logout: UserActions.logout
};

const connectedLoginPage = connect(mapState, actionCreators)(LoginPage);
export { connectedLoginPage as LoginPage };