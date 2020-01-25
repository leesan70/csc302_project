import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { connect } from 'react-redux';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';

import { History } from 'Helpers';
import { AlertActions } from 'Actions';
import { PrivateRoute } from 'Components';
import { HomePage } from 'Views/HomePage';
import { LoginPage } from 'Views/LoginPage';
import { RegisterPage } from 'Views/RegisterPage';
import { TestPage } from 'Views/TestPage';
import { UploadFormPage } from 'Views/UploadFormPage';
import { FormTestPage } from 'Views/FormTestPage';
import { FormSelectorPage } from 'Views/FormSelectorPage';
import { FormQueryPage } from 'Views/FormQueryPage';

const theme = createMuiTheme({});
import './App.css';

class App extends React.Component {
    constructor(props) {
        super(props);

        History.listen((location, action) => {
            // clear alert on location change
            this.props.clearAlerts();
        });
    }

    render() {
        const { alert } = this.props;
        return (
            <MuiThemeProvider theme={theme}>
                <div style={{height: '100%'}}>
                    {alert.message &&
                    <div className={`alert ${alert.type}`}>{alert.message}</div>
                    }
                    <Switch>
                        <Route path="/login" component={LoginPage} />
                        <Route path="/register" component={RegisterPage} />
                        <Route path="/test" component={TestPage} />
                        <Route path="/form/:diagnosticProcedureID" component={FormTestPage} />
                        <Route path="/formSelector" component={FormSelectorPage} />
                        <Route path="/upload" component={UploadFormPage} />
                        <Route path="/query" component={FormQueryPage} />
                        <Route path="/" component={LoginPage} />                        
                    </Switch>
                </div>
            </MuiThemeProvider>
        );
    }
}

function mapState(state) {
    const { alert } = state;
    return { alert };
}

const actionCreators = {
    clearAlerts: AlertActions.clear
};

const connectedApp = connect(mapState, actionCreators)(App);
export { connectedApp as App };