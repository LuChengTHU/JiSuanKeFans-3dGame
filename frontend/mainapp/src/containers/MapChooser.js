import createReactClass from 'create-react-class'
import React from 'react'
import MapLink from '../components/MapLink'

const MapChooser = createReactClass(
    {
        getInitialState: function(props){
            return {pageNo: 1, ready: false, mapList: []};
        },
        
        loadMapList: function(){
            this.props.mapFetcher.fetch(this.state.pageNo).then( (map_list) =>
                this.setState({mapList: map_list, ready: true})
            );
        },

        render: function(){
            if(!this.state.ready){
                this.loadMapList();
                return (<div>
                    Loading...
                </div>);
            }
            const maplink_list = this.state.mapList.map((map) => <MapLink map={map}/>);
            return (<div>{maplink_list}</div>);
        }
    }
);


export default MapChooser;
