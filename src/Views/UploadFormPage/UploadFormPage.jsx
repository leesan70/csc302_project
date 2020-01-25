import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { FormActions, UserActions } from 'Actions'

import {
    Button,
    AppBar,
    Toolbar,
    IconButton,
    List,
    Input,
    Card, 
    Grid, 
    Collapse,
    makeStyles,
} from '@material-ui/core';

import MenuIcon from '@material-ui/icons/Menu'; 

import DeleteForm from './DeleteForm'

class UploadFormPage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            selectedForm: "NA",
            menuIsOpen: false,
            loaded: null
        };

        this.handleChange = this.handleChange.bind(this);
        this.menuToggle = this.menuToggle.bind(this);
        this.handleLogout = this.handleLogout.bind(this);
    }

    menuToggle() {
        this.setState({ menuIsOpen: !this.state.menuIsOpen })
    }

    handleLogout() {
        this.props.logout();
        return this.props.history.push(`/login`)
    }

    async componentDidMount() {
        await this.props.getFormList();
    }

    handleChange(event){
        this.setState({
          selectedForm: event.target.files[0].name,
          loaded: 0,
        })
        console.log(event.target.files[0])
    }

    render() {
        const { registering  } = this.props;
        const { selectedForm, loaded} = this.state;

        return (
            <React.Fragment>
                <div className="uploadWrapper">

                    <AppBar position="static" className="appBar">
                        <Toolbar>
                            <h3 className="noselect">Form Management</h3>
                            <div className="menuButton">
                                <IconButton edge="start" color="inherit" aria-label="menu" 
                                    onClick={ this.menuToggle }>
                                    <MenuIcon/>
                                </IconButton>
                            </div>
                        </Toolbar>
                    </AppBar>
                    <Collapse in={this.state.menuIsOpen} className="appBar menuDropdown">
                        <List>
                            <Button href='/formSelector'> Form Selection </Button>
                            <br/>
                            <Button href='/query'> Query Runner </Button>
                            <br/>
                            <Button href='/docs'> Documentation </Button>
                            <br/>
                            <Button onClick={this.handleLogout}>Logout</Button>
                        </List>
                    </Collapse>
                    <br/>
                <div className="content">
                    <div className="uploadGroup">
                        <form class="form" action="/api/form" method="post" enctype="multipart/form-data" style={{textAlign:"center", display: "grid"}}>
                            <input
                        accept=".xml"
                        style={{ display: 'none'}}
                        id="raised-button-file"
                        multiple
                        type="file"
                        onChange={this.handleChange}
                        name="form"
                        />
                        <label htmlFor="raised-button-file" style={{width:"100%", padding:5}}>
                        <Button className="uploadButton" variant="raised" component="span">
                            Upload Form
                        </Button>
                        </label>
                        <h4>Uploaded File: {selectedForm}</h4>
                        <br></br>
                        <Input type="text" style={{textSizeAdjust: "200%", marginLeft: "25%", marginRight:"25%" }} placeholder='Enter Procedure ID' name="diagnosticProcedureID" required></Input>
                        <br/>
                        <Button className="submitButton" variant="contained" color="primary" type="submit" onClick={this.onSubmit}>Submit</Button>
                        </form>
                    </div>

                    <DeleteForm {...this.props} ></DeleteForm>
                </div>
            </div>
        </React.Fragment>
        );
    }
}

function mapState(state) {
    const { form, authentication } = state;
    const { user } = authentication;

    return { user, form };
}

const actionCreators = {
    getForm: FormActions.getForm,
    getFormList: FormActions.getFormList,
    getRecentlyAccessedList: FormActions.getRecentlyAccessedList,
    logout: UserActions.logout
}

const connectedUploadFormPage = connect(mapState, actionCreators)(UploadFormPage);
export { connectedUploadFormPage as UploadFormPage };
