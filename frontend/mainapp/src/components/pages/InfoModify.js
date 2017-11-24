import React from 'react'
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class'
import Button from 'material-ui/Button'
import TextField from 'material-ui/TextField'
import axios from 'axios'
import Typography from 'material-ui/Typography'
import List from 'material-ui/List'
import MenuItem from 'material-ui/Menu/MenuItem'
import {withStyles} from 'material-ui/styles'
import Card, { CardActions, CardContent } from 'material-ui/Card';

const styles = theme => ({
    textField: {
        // marginLeft: theme.spacing.unit,
        // marginRight: theme.spacing.unit,
        margin: theme.spacing.unit,
        width: 300,
    },
    menu: {
        width: 300,
    },
    root: {
        display: 'flex',
        justifyContent: 'center',
    },
    buttonGroup: {
        display: 'flex',
        justifyContent: 'center',
    },
    card: {
        '&:first-child': {
            paddingTop: theme.spacing.unit,
        },
    }
});

const genders = [
    {
        value: 0,
        label: '♂',
    },
    {
        value: 1,
        label: '♀',
    },
    {
        value: 2,
        label: '🐱',
    },
];

class InfoModify extends React.Component {
    static propTypes = {
        classes: PropTypes.object.isRequired,
    }

    constructor(props)
    {
        super(props)
        this.state = {
            username: '',
            gender: 0,
            old_password: '',
            new_password: '',
        };

        this.updateInfo()
    }

    handleInputChange = name => event => {
        this.setState({
          [name]: event.target.value,
        });
    };

    updateInfo = () => {
        axios.get('modify/', {})
            .then((response) => {
                if (response.data.res_code !== null) {
                    if (response.data.res_code === 1) {
                        this.setState({
                            username: response.data['username'],
                            gender: response.data['gender'],
                        })
                    }
                }
            })
    }
    
    submitInfo = (e) => {
        let _new_password = this.state.new_password
        if (_new_password === '')
            _new_password = this.state.old_password
        const paylord = {
            'username': this.state.username,
            'gender': this.state.gender,
            'old_password': this.state.old_password,
            'new_password': _new_password,
        }
        
        axios.post('modify/', paylord);
        // e.preventDefault();
    }

    render() 
    {
        const { classes } = this.props;
        return (
            <div className={classes.root}>
                <form onSubmit={this.submitInfo}>
                {/* <List> */}
      <Card className={classes.card}>
        <CardContent>
                <Typography type="headline" component="h2" align="center"> 个人信息 </Typography>
            <div>
                    <TextField 
                        className={classes.textField}
                        required={true}
                        id="username"
                        label="用户名"
                        value={this.state.username}
                        onChange={this.handleInputChange('username')}
                    />
                    </div>
                    <div>
                    <TextField
                        className={classes.textField}
                        required={true}
                        id="gender"
                        label="性别"
                        select
                        value={this.state.gender}
                        SelectProps={{
                            MenuProps: {
                              className: classes.menu,
                            },
                          }}
                        onChange={this.handleInputChange('gender')}
                    >
                        {genders.map(option => (
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </TextField>
                    </div>
                    <div>
                    <TextField 
                        className={classes.textField}
                        required={true}
                        id="old_password"
                        type="password"
                        label="原密码"
                        placeholder="Required"
                        value={this.state.old_password}
                        onChange={this.handleInputChange('old_password')}
                    />
                    </div>
                    <div>
                    <TextField 
                        className={classes.textField}
                        required={false}
                        id="new_password"
                        type="password"
                        placeholder="Required when changing password"
                        label="新密码"
                        value={this.state.new_password}
                        onChange={this.handleInputChange('new_password')}
                    />
                    </div>
                    <div className={classes.buttonGroup}>
                    <Button color="primary" type={'submit'}>
                        提交
                    </Button>
                    <Button onClick={this.updateInfo} color="primary">
                        重置
                    </Button>
                    </div>
                    </CardContent>
                </Card>
                {/* </List> */}
                </form>
            </div>
        );
    }
}


export default withStyles(styles)(InfoModify);
