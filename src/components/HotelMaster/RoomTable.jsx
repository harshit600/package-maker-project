import React from 'react';

function RoomTable() {
    return (
        <table className="table table-striped table-bordered">
            <thead>
                <tr>
                    <th style={{ width: '20%', fontSize: '0.8rem' }}>Room Name</th>
                    <th style={{ fontSize: '0.8rem' }}>Description</th>
                    <th style={{ fontSize: '0.8rem' }}>Actions</th>
                    <th style={{ fontSize: '0.8rem' }}>Rateplans</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td style={{ fontSize: '0.8rem' }}>Family Suite</td>
                    <td style={{ fontSize: '0.8rem' }}>
                        <p style={{ fontSize: '0.8rem' }}>
                            Family Room with all modern facilities. All rooms are neat and clean. The size of the room is so large that it can easily accommodate another bed, if desired, without disturbing the present set up. Each room is having a spacious bathroom with hot water shower and full-size mirror.
                        </p>
                    </td>
                    <td style={{ fontSize: '0.8rem' }}>
                        <div className="form-check">
                            <input className="form-check-input" type="checkbox" id="activeCheckbox" defaultChecked />
                            <label className="form-check-label" htmlFor="activeCheckbox">
                                Active
                            </label>
                        </div>
                        <button type="button" className="btn btn-link" style={{ fontSize: '0.8rem' }}><i className="bi bi-pencil"></i> Edit Room</button>
                        <button type="button" className="btn btn-link" style={{ fontSize: '0.8rem' }}><i className="bi bi-pencil"></i> Edit Amenities</button>
                        <button type="button" className="btn btn-link" style={{ fontSize: '0.8rem' }}><i className="bi bi-plus"></i> Add Rate Plan</button>
                    </td>
                    <td style={{ fontSize: '0.8rem' }}>
                        <button type="button" className="btn btn-link" style={{ fontSize: '0.8rem' }}>Click to View Details</button>
                    </td>
                </tr>
                <tr>
                    <td style={{ fontSize: '0.8rem' }}>Family Suite</td>
                    <td style={{ fontSize: '0.8rem' }}>
                        <p style={{ fontSize: '0.8rem' }}>
                            Family Room with all modern facilities. All rooms are neat and clean. The size of the room is so large that it can easily accommodate another bed, if desired, without disturbing the present set up. Each room is having a spacious bathroom with hot water shower and full-size mirror.
                        </p>
                    </td>
                    <td style={{ fontSize: '0.8rem' }}>
                        <div className="form-check">
                            <input className="form-check-input" type="checkbox" id="activeCheckbox" defaultChecked />
                            <label className="form-check-label" htmlFor="activeCheckbox">
                                Active
                            </label>
                        </div>
                        <button type="button" className="btn btn-link" style={{ fontSize: '0.8rem' }}><i className="bi bi-pencil"></i> Edit Room</button>
                        <button type="button" className="btn btn-link" style={{ fontSize: '0.8rem' }}><i className="bi bi-pencil"></i> Edit Amenities</button>
                        <button type="button" className="btn btn-link" style={{ fontSize: '0.8rem' }}><i className="bi bi-plus"></i> Add Rate Plan</button>
                    </td>
                    <td style={{ fontSize: '0.8rem' }}>
                        <button type="button" className="btn btn-link" style={{ fontSize: '0.8rem' }}>Click to View Details</button>
                    </td>
                </tr>
            </tbody>
        </table>
    );
}

export default RoomTable;
