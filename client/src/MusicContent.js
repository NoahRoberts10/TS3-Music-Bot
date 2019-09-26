import React from 'react';

function MusicContent(props) {
    return (
        <div className="columns is-centered is-vcentered is-mobile">
            <div className="column is-3 is-narrow has-text-centered">
                <p>Previous</p>
            </div>
            <div className="column is-6 is-narrow has-text-centered">
                <p>{props.current}</p>
            </div>
            <div className="column is-3 is-narrow has-text-centered">
                <p>Next</p>
            </div>
        </div>
    )
}

export default MusicContent;