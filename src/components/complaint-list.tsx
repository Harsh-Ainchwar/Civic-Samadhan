'use client';

import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

interface Complaint {
  id: string;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  timestamp: any;
}

const ComplaintList: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchComplaints = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'complaints'));
      const complaintsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Complaint[];

      setComplaints(complaintsData);
    } catch (error) {
      console.error('Error fetching complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this complaint?');
    if (!confirmDelete) return;

    try {
      setDeletingId(id);
      await deleteDoc(doc(db, 'complaints', id));
      setComplaints((prev) => prev.filter((complaint) => complaint.id !== id));
      alert('Complaint deleted successfully.');
    } catch (error) {
      console.error('Error deleting complaint:', error);
      alert('Failed to delete complaint.');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <p>Loading complaints...</p>;

  return (
    <div
      style={{
        backgroundColor: '#f8f9fa',
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}
    >
      <h2 style={{ marginBottom: '15px' }}>📋 Reported Complaints</h2>

      {complaints.length === 0 ? (
        <p>No complaints found.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: '#343a40', color: '#fff' }}>
            <tr>
              <th style={{ padding: '10px', textAlign: 'left' }}>Title</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Description</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Latitude</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Longitude</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Timestamp</th>
              <th style={{ padding: '10px', textAlign: 'left' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {complaints.map((complaint) => (
              <tr key={complaint.id} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '10px' }}>{complaint.title}</td>
                <td style={{ padding: '10px' }}>{complaint.description}</td>
                <td style={{ padding: '10px' }}>{complaint.latitude}</td>
                <td style={{ padding: '10px' }}>{complaint.longitude}</td>
                <td style={{ padding: '10px' }}>
                  {complaint.timestamp?.toDate
                    ? complaint.timestamp.toDate().toLocaleString()
                    : new Date(complaint.timestamp).toLocaleString()}
                </td>
                <td style={{ padding: '10px' }}>
                  <button
                    onClick={() => handleDelete(complaint.id)}
                    disabled={deletingId === complaint.id}
                    style={{
                      backgroundColor: deletingId === complaint.id ? '#aaa' : '#e63946',
                      color: 'white',
                      border: 'none',
                      padding: '6px 10px',
                      borderRadius: '5px',
                      cursor: deletingId === complaint.id ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {deletingId === complaint.id ? 'Deleting...' : 'Delete'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ComplaintList;
