import React from 'react'
import createReactClass from 'create-react-class'
import MapChooser from '../../containers/MapChooser'
import axios from 'axios'
import Typography from 'material-ui/Typography'
import {withStyles} from 'material-ui/styles'

const styles = theme => ({});

const StageGallery = createReactClass({
    getInitialState: function(){
        if(this.props.author_id)
            this.author_id = this.props.author_id;
        else if('author_id' in this.props.match.params){
            this.author_id = this.props.match.params['author_id'];
        } else{
            this.author_id = -1;
        }
		this.mapFetcher = {
			fetch: pageNo => axios.get('map/?pageNo=' + pageNo + (this.author_id !== -1 ? "&authorId=" + this.author_id : "")).then(response =>
				({
					map_list: response.data.list, has_prev: response.data.has_prev,
					has_next: response.data.has_next
				})
			)
		};
		return null;
	},
    render: function(){
		if(this.author_id === 1)
			return (
				<div>
					<Typography type="title" align="center">主线关卡</Typography> 
					<MapChooser mapFetcher={this.mapFetcher}
						onClick={(map) => this.props.history.push('/game/' + map.id + '/')} />
				</div>
			);
		else
			return (
				<div>
					<Typography type="title" align="center">所有关卡</Typography> 
					<MapChooser mapFetcher={this.mapFetcher}
						onClick={(map) => this.props.history.push('/game/' + map.id + '/')} />
				</div>
			);
    }
});


export default withStyles(styles)(StageGallery);
