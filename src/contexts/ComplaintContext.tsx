import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { saveReport, fetchReports } from '../firebase';

export interface Complaint {
  id: string;
  title: string;
  category: string;
  description: string;
  address: string;
  coordinates: { lat: number; lng: number };
  status: "new" | "in-progress" | "resolved" | "rejected";
  priority: "low" | "medium" | "high" | "critical";
  date: string;
  submittedBy: string;
  assignedTo?: string;
  adminNotes?: string;
  photos: Array<{
    id: string;
    url: string;
    filename: string;
  }>;
}

interface ComplaintContextType {
  complaints: Complaint[];
  addComplaint: (complaint: Complaint) => void;
  updateComplaint: (complaintId: string, updates: Partial<Complaint>) => void;
  deleteComplaint: (complaintId: string) => void;
  loading: boolean;
}

const ComplaintContext = createContext<ComplaintContextType | undefined>(undefined);

export function ComplaintProvider({ children }: { children: ReactNode }) {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  // Load complaints from Firebase on initialization
  useEffect(() => {
    const loadComplaints = async () => {
      try {
        setLoading(true);
        const fetchedReports = await fetchReports();
        console.log('Fetched reports from Firebase:', fetchedReports);
        setComplaints(fetchedReports as Complaint[]);
      } catch (err) {
        console.error('Error loading complaints:', err);
      } finally {
        setLoading(false);
      }
    };

    loadComplaints();
  }, []);

  const addComplaint = async (complaint: Complaint) => {
    console.log('✅ ComplaintContext - Adding complaint:', {
      id: complaint.id,
      title: complaint.title,
      photosCount: complaint.photos?.length || 0,
      photos: complaint.photos?.map(p => ({ 
        id: p.id, 
        filename: p.filename, 
        urlLength: p.url?.length,
        urlType: p.url?.startsWith('data:') ? 'base64' : 'external',
        urlPrefix: p.url?.substring(0, 50) 
      }))
    });
    setComplaints((prev: Complaint[]) => [complaint, ...prev]); // Add new complaints at the beginning

    // Persist to Firestore and wait for completion
    try {
      // Create a copy of the complaint with the correct photo structure for Firebase
      const complaintForFirebase = {
        ...complaint,
        photos: complaint.photos?.map(photo => ({
          id: photo.id,
          filename: photo.filename,
          url: photo.url
        })) || []
      };
      
      const res = await saveReport(complaintForFirebase);
      if (res?.ok) {
        console.log('✅ ComplaintContext - saved report to Firestore', res.id);
        return res;
      } else {
        console.error('❌ ComplaintContext - failed to save report', res?.error);
        // Show user-friendly error message
        const errorMessage = res?.error?.userMessage || 'Failed to save your complaint to the database. Please try again or contact support.';
        alert(errorMessage);
        return res;
      }
    } catch (err) {
      console.error('❌ ComplaintContext - exception while saving report', err);
      // Show error to user
      alert('An error occurred while saving your complaint. Please try again.');
      throw err;
    }
  };

  const updateComplaint = (complaintId: string, updates: Partial<Complaint>) => {
    setComplaints((prev: Complaint[]) => 
      prev.map((complaint: Complaint) => 
        complaint.id === complaintId 
          ? { ...complaint, ...updates }
          : complaint
      )
    );
    
    // Also update in Firebase
    (async () => {
      try {
        const complaint = complaints.find((c: Complaint) => c.id === complaintId);
        if (complaint) {
          const updatedComplaint = { ...complaint, ...updates };
          const res = await saveReport(updatedComplaint);
          if (res?.ok) {
            console.log('✅ ComplaintContext - updated report in Firestore', res.id);
          } else {
            console.error('❌ ComplaintContext - failed to update report', res?.error);
          }
        }
      } catch (err) {
        console.error('❌ ComplaintContext - exception while updating report', err);
      }
    })();
  };

  const deleteComplaint = (complaintId: string) => {
    setComplaints((prev: Complaint[]) => prev.filter((complaint: Complaint) => complaint.id !== complaintId));
    
    // Also delete from Firebase (optional)
    console.log('Deleting complaint from Firebase:', complaintId);
  };

  return (
    <ComplaintContext.Provider value={{ complaints, addComplaint, updateComplaint, deleteComplaint, loading }}>
      {children}
    </ComplaintContext.Provider>
  );
}

export function useComplaints() {
  const context = useContext(ComplaintContext);
  if (context === undefined) {
    throw new Error('useComplaints must be used within a ComplaintProvider');
  }
  return context;
}
