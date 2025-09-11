import React, { useState, useEffect } from 'react';
import { Plus, Filter, MapPin } from 'lucide-react';
import PracticeCard from '../cards/PracticeCard';
import EventCard from '../cards/EventCard';
import { Practice, Event } from '../../types';
import { collection, getDocs } from 'firebase/firestore';
import { firestore } from '../../lib/RUNWITH2__codex_probe_927';

const Feed: React.FC = () => {
  const [practices, setPractices] = useState<Practice[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const practiceSnap = await getDocs(collection(firestore, 'practices'));
        const eventSnap = await getDocs(collection(firestore, 'events'));
        const loadedPractices = practiceSnap.docs.map(d => ({ id: d.id, ...(d.data() as Practice) }));
        const loadedEvents = eventSnap.docs.map(d => ({ id: d.id, ...(d.data() as Event) }));
        setPractices(loadedPractices);
        setEvents(loadedEvents);
      } catch (err) {
        console.error('Failed to load feed', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeed();
  }, []);

  const handleKudos = (practiceId: string) => {
    setPractices(practices.map(practice => 
      practice.id === practiceId 
        ? { ...practice, stats: { ...practice.stats, kudos: practice.stats.kudos + 1 } }
        : practice
    ));
  };

  const handleJoinRequest = (practiceId: string) => {
    console.log('Join request sent for practice:', practiceId);
  };

  const handleComment = (practiceId: string) => {
    console.log('Open comments for practice:', practiceId);
  };

  const handleJoinEvent = (eventId: string) => {
    setEvents(events.map(event => 
      event.id === eventId 
        ? { ...event, stats: { ...event.stats, attendees: event.stats.attendees + 1 } }
        : event
    ));
  };

  const handleBookmarkEvent = (eventId: string) => {
    setEvents(events.map(event => 
      event.id === eventId 
        ? { ...event, stats: { ...event.stats, bookmarks: event.stats.bookmarks + 1 } }
        : event
    ));
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto px-4 py-6">
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-xl p-4 shadow-sm animate-pulse">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="space-y-1">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-4">
                {[1, 2, 3].map(j => (
                  <div key={j} className="text-center">
                    <div className="h-6 bg-gray-200 rounded mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-12 mx-auto"></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Mix practices and events chronologically
  const feedItems = [...practices, ...events]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="max-w-md mx-auto px-4 py-4 mb-20">
      {/* Location Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <MapPin size={16} className="text-gray-500" />
          <span className="text-sm text-gray-600">Tokyo, Shibuya area</span>
        </div>
        <button className="p-2 text-gray-500 hover:text-gray-700 transition-colors">
          <Filter size={16} />
        </button>
      </div>

      {/* Feed Items */}
      <div className="space-y-4">
        {feedItems.map(item => {
          if ('intensity' in item) {
            // It's a practice
            return (
              <PracticeCard
                key={item.id}
                practice={item}
                onKudos={handleKudos}
                onJoinRequest={handleJoinRequest}
                onComment={handleComment}
              />
            );
          } else {
            // It's an event
            return (
              <EventCard
                key={item.id}
                event={item}
                onJoin={handleJoinEvent}
                onBookmark={handleBookmarkEvent}
              />
            );
          }
        })}
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => setShowCreateModal(true)}
        className="fixed bottom-20 right-4 w-14 h-14 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center justify-center z-40"
      >
        <Plus size={24} />
      </button>

      {/* Create Modal */}
      {showCreateModal && (
        <CreateModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
};

// Simple create modal component
const CreateModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-sm w-full p-6">
        <h3 className="text-lg font-semibold mb-4">Create New</h3>
        <div className="space-y-3">
          <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            Share a Practice
          </button>
          <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            Create Event
          </button>
        </div>
        <button
          onClick={onClose}
          className="w-full mt-4 p-3 text-gray-500 hover:bg-gray-50 rounded-lg transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default Feed;