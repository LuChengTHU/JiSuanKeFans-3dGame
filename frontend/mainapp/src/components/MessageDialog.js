/* eslint-disable flowtype/require-valid-file-annotation */

import React from 'react';
import Button from 'material-ui/Button';
import { withStyles } from 'material-ui/styles';
import Dialog, {
  DialogActions,
  DialogContent,
  DialogTitle,
} from 'material-ui/Dialog';
import PropTypes from 'prop-types';

const styles = (/*theme*/) => ({
})

class MessageDialog extends React.Component {
  constructor(props) 
  {
    super(props);
    this.muiName = 'Dialog';
  }

  render() {
    const { onRequestClose, closeText, onRequestConfirm, confirmText, title, ...other } = this.props;
    let confirmButton = null, closeButton = null;
    if (onRequestConfirm)
    {
        confirmButton = <Button id={'confirm'} onClick={onRequestConfirm} color="primary">
                { confirmText }
            </Button>;
    }
    if (onRequestClose)
    {
        closeButton = <Button id={'cancel'} onClick={onRequestClose} color="primary">
                { closeText }
            </Button>;
    }
    return (
        <Dialog {...other} onRequestClose={onRequestClose} >
          <DialogTitle>{ title }</DialogTitle>
          <DialogContent>
            { this.props.children }
          </DialogContent>
          <DialogActions>
            { confirmButton }
            { closeButton }
          </DialogActions>
        </Dialog>
    );
  }
}

MessageDialog.propTypes = {
    title: PropTypes.string.isRequired,
    closeText: PropTypes.string,
    onRequestClose: PropTypes.func,
    confirmText: PropTypes.string,
    onRequestConfirm: PropTypes.func,
};

export default withStyles(styles)(MessageDialog);