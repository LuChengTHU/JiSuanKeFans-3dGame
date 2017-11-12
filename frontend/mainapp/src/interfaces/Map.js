import axios from 'axios'

export function fetch_map(map_id){
    const INIT_MAP = { // initial map
        title: 'Untitled',
        height: 10,
        width: 10,
        n_max_hand_boxes: 4,
        n_blockly: 10,
        instr_set: [true, true, true],
        init_AI_infos: [],
        init_pos: [1, 1],
        final_pos: [1, 2],
        init_ground_colors: [[0, 0, 0], [0, 0, 0]],
        final_ground_colors: null,
        init_ground_boxes: [[null, null, null], [null, null, null]],
        final_ground_boxes: null,
        init_hand_boxes: [],
        final_hand_boxes: [],
        init_dir:16,
        failed_msg: 'Failed!',
        passed_msg: 'Passed!',
        std_blockly_code: '',
        welcome_msg: 'Welcome!'
    };

    window.map = INIT_MAP;
    return axios.get('map/' + map_id + '/')
        .then(function(response){
            if(response.data.res_code === 1){
                window.map = response.data.map;
                delete window.map.author;
            } else
                console.log('ERROR ' + response.data.res_code);
            return response;
        }).catch(function(error){
            console.log(error); // only for testing
        });
}

export function create_map(map){
    console.log(map);
    return axios.post('map/', {map:map})
        .then(function(response){
            if(response.data.res_code === 1){
                console.log('Succeeded!');
                return response.data.map_id;
            }
            return -1;
        }).catch(function(error){

        });
}

export function modify_map(map_id, map){
    axios.put('map/' + map_id + '/', {new_map_info: map})
        .then(function(response){
            if(response.data.res_code === 1){
                console.log('Succeeded!');
            }
        }).catch(function(error){

        });
}
