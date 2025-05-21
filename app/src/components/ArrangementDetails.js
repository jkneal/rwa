import React from 'react';
import { useState, useEffect } from 'react';

export const ArrangementDetails = ({ documentNumber }) => {
    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/arrangement/${documentNumber}/details`);
                const data = await response.json();
                setDetails(data);
            } catch (err) {
                setError('Failed to load details');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, []);  // Missing dependency: documentNumber

    if (loading) return <div>Loading details...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="arrangement-details-panel">
            <h3>Arrangement Details</h3>
            <table>
                <tbody>
                    {details && Object.entries(details).map(([key, value]) => (
                        <tr key={key}>
                            <td>{key}</td>
                            <td>{value}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ArrangementDetails;