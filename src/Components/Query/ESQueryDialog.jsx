import React from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
    TextField
} from '@material-ui/core';

export class ESQueryDialog extends React.Component {
    constructor(props) {
      super(props);
      this.state = {query: ""};
    }

    render() {
      const onQueryChange = async (event) => this.setState({query: event.target.value});
      const onSendQuery = async () => {
        this.props.sendESQuery(this.state.query);
        this.props.onClick();
      }

      return(
        <Dialog open={this.props.open} onClose={this.props.handleClose}>
          <DialogTitle id="form-dialog-title">Run Elasticsearch Query</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Run a custom Elasticsearch Query.
            </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              id="name"
              label="Query"
              type="text"
              onChange={onQueryChange}
              value={this.state.query}
              multiline={true}
              fullWidth
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={this.props.onClick} color="secondary">
              Close
            </Button>
            <Button onClick={() => this.setState({query: JSON.stringify(this.props.query, null, "\t")})} disabled={this.props.query === undefined} color="default">
              Use result query
            </Button>
            <Button onClick={onSendQuery} color="primary">
              Run Elasticsearch Query
            </Button>
          </DialogActions>
        </Dialog>
      );
    }
}