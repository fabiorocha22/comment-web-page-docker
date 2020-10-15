import React, { Component } from 'react'
import $ from 'jquery'
import MaterialTable from 'material-table'
import axios from 'axios'

const getAudioContext = () => {
    AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioContent = new AudioContext();
    return audioContent;
};

export default class Comment extends Component {

    constructor(props) {
        super(props);

        this.state = {
            comment: "",
            values: []
        }

        $.ajax({
            url: 'https://mwau850imi.execute-api.sa-east-1.amazonaws.com/dev/getcomment',
            type: 'GET',
            crossDomain: true,
            success: (success) => {
                console.log(success)
                if (success.length > 0) {
                    success.forEach(element => {
                        element.listen = <button onClick={(e) => { this.listen(element.comment) }}>&#x266A;</button>
                    });
                    this.setState({
                        values: success
                    })
                }
            },
            error: (err) => {
                console.error(err)
            }
        })

        this.saveComment = this.saveComment.bind(this);
        this.listen = this.listen.bind(this);
    }

    async listen(value) {
        const response = await axios.post('https://mwau850imi.execute-api.sa-east-1.amazonaws.com/dev/speech', 
            { value }, { responseType: 'text' });

        const base64_arraybuffer = require('base64-arraybuffer')
        const array_buffer = base64_arraybuffer.decode(response.data.data)

        const audioContext = getAudioContext();
        const audioBuffer = await audioContext.decodeAudioData(array_buffer);

        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);

        source.start();
    }

    saveComment() {

        console.log($('#new_comment').val())

        $.ajax({
            url: 'https://mwau850imi.execute-api.sa-east-1.amazonaws.com/dev/appendcomment',
            data: JSON.stringify({
                comment: $('#new_comment').val()
            }),
            type: 'POST',
            crossDomain: true,
            dataType: 'json',
            contentType: "application/json",
            success: (success) => {
                $.ajax({
                    url: 'https://mwau850imi.execute-api.sa-east-1.amazonaws.com/dev/getcomment',
                    type: 'GET',
                    crossDomain: true,
                    success: (success) => {
                        console.log(success)
                        if (success.length > 0) {
                            success.forEach(element => {
                                element.listen = <button onClick={(e) => { this.listen(element.comment) }}>&#x266A;</button>
                            });
                            this.setState({
                                values: success
                            })
                        }
                    },
                    error: (err) => {
                        console.error(err)
                    }
                })
            },
            error: (error) => {
                console.log(error)
            }
        })
    }

    render() {
        return (
            <div className="comment" style={{ minWidth: '100%', display: 'inline-block' }}>
                <h2>Comentário</h2>
                <div style={{ width: '100%', display: 'block' }}>
                    <input id='new_comment' type="text" style={{ width: '100%', height: '100%', display: 'block' }}></input>
                </div>
                <div style={{ width: '100%', display: 'block' }}>
                    <input type='button' value="Cadastrar" style={{ display: 'block' }} onClick={(e) => { this.saveComment() }}></input>
                </div>
                <div style={{ minWidth: '100%', display: 'inline-grid' }}>
                    <MaterialTable
                        columns={[
                            { title: 'comment', field: 'comment' },
                            { title: 'listen', field: 'listen' },
                        ]}
                        data={this.state.values}
                        title=""
                        options={{
                            search: false,
                            rowStyle: {
                                backgroundColor: '#EEE',
                            },
                            grouping: false,
                            selection: false,
                            sorting: false,
                            paging: false
                        }}
                    />
                </div>

            </div>
        )
    }
}