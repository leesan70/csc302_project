import React from 'react';
import { Link } from 'react-router-dom';

import {
    Button,
    Card,
    List,
    ListItem
} from '@material-ui/core';

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
   
class DeleteForm extends React.Component {
    
    constructor(props) {
        super(props);
        this.allForms = this.allForms.bind(this);
        this.sendDelete = this.sendDelete.bind(this);
    }
    
    state = {
      open: false,
      formToDelete: ""
    };
   
    handleClose = () => {
      this.setState({
        open: false,
        formToDelete: ""
      });
    };
   
    handleClick = (id) => {
      this.setState({
        open: true,
        formToDelete: id
      });
    };

    sendDelete() {
        fetch("/api/form/" + this.state.formToDelete, {method: "DELETE"}).then((response) => {
            console.log(response.json())
          }).then((result) => {
            // do what you want with the response here
            this.setState({
                open: false,
                formToDelete: ""
              });
            location.reload();
          });
    }

    allForms() {        
        if (this.props.form && !this.props.form.loading && this.props.form && this.props.form.forms && this.props.form.forms.length > 0){
            return this.props.form.forms.map(el => 

                <ListItem type='newForm' id={el.diagnosticProcedureID}>
                    <Button style={{background: "white", width: "100%"}} component={Link} onClick={() => { this.handleClick(el.diagnosticProcedureID) }} >
                        {el.title + " : " + el.diagnosticProcedureID}
                    </Button>
                </ListItem> 
                )
        } else {
            return <h5 style={{marginLeft: "15px"}}>No forms availible at this time.</h5>
        }
    }

    async componentDidMount() {
        await this.props.getFormList();
        await this.props.getRecentlyAccessedList(0);
    }
   
    render() {
      const { open, formToDelete } = this.state;
   
      return (
        <Card style={{background:"lightgrey"}} className="formSelector uploadCard">
            <h4 style={{margin: "15px 15px 0px 15px"}}>Select a form to delete:</h4>
                <List>
                    {this.allForms()}
                </List>
            <Dialog
                open={open}
                onClose={this.handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <div className="deleteDialog">
                <DialogTitle id="alert-dialog-title">{"Do you want to delete " + formToDelete + "?"}</DialogTitle>
                <DialogContent>
                <DialogContentText id="alert-dialog-description">
                    This will prevent others from making new Filled Forms with this form's current version. Previously filled forms will still be able to be viewed.
                </DialogContentText>
                </DialogContent>
                <DialogActions>
                <Button onClick={this.handleClose} color="primary">
                    No
                </Button>
                <Button onClick={this.sendDelete} color="primary" autoFocus>
                    Yes
                </Button>
                </DialogActions>
                </div>
            </Dialog>
        </Card>
      );
    }
}

  
export default DeleteForm;