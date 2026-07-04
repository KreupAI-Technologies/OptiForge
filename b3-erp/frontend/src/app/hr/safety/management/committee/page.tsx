'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Calendar,
  MessageSquare,
  CheckSquare,
  ClipboardCheck,
  Plus,
  ArrowRight,
  Clock,
  AlertCircle
} from 'lucide-react';
import { HrSafetyService, SafetyTraining } from '@/services/hr-safety.service';

interface CommitteeMember {
  id: string;
  name: string;
  role: string;
  department: string;
  termEnds: string;
  status: string;
}

const actionItems = [
  { id: 1, title: 'Install guard rails on Line 3', assignee: 'Facilities', priority: 'High', due: '2024-04-10', status: 'In Progress' },
  { id: 2, title: 'Update evacuation maps', assignee: 'EHS', priority: 'Medium', due: '2024-04-20', status: 'Pending' },
  { id: 3, title: 'Investigate slip incident', assignee: 'Robert Fox', priority: 'High', due: '2024-04-05', status: 'Completed' },
  { id: 4, title: 'Review new PPE vendor', assignee: 'Procurement', priority: 'Low', due: '2024-05-01', status: 'Pending' },
];

const meetings = [
  { id: 1, title: 'Monthly Safety Review', date: 'Apr 05, 2024', time: '14:00 - 15:30', room: 'Conf Room A', type: 'Upcoming' },
  { id: 2, title: 'Q1 Performance Review', date: 'Mar 05, 2024', time: '14:00 - 15:30', room: 'Conf Room A', type: 'Past' },
  { id: 3, title: 'Incident Analysis Meeting', date: 'Feb 15, 2024', time: '10:00 - 11:30', room: 'Huddle Room 2', type: 'Past' },
];

export default function SafetyCommitteePage() {
  return (
    <div className="p-6 space-y-3">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="h-8 w-8 text-orange-600" />
            Safety Committee
          </h1>
          <p className="text-gray-500 mt-1">Committee oversight, planning, and actions</p>
        </div>
        <button className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 shadow-sm transition-colors">
          <Calendar className="w-4 h-4 mr-2" />
          Schedule Meeting
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-3">
          {/* Committee Members */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">Committee Members</h3>
              <button className="text-sm text-orange-600 hover:text-orange-700 font-medium">Manage Roster</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-500">
                  <tr>
                    <th className="px-3 py-2">Name</th>
                    <th className="px-3 py-2">Role</th>
                    <th className="px-3 py-2">Department</th>
                    <th className="px-3 py-2">Term Ends</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {committeeMembers.map((member) => (
                    <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 py-2 font-medium text-gray-900">{member.name}</td>
                      <td className="px-3 py-2">
                        <span className="inline-flex items-center px-2 py-1 rounded bg-orange-50 text-orange-700 text-xs font-medium">
                          {member.role}
                        </span>
                      </td>
                      <td className="px-3 py-2">{member.department}</td>
                      <td className="px-3 py-2 text-gray-500">{member.termEnds}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Action Items */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">Action Items Tracking</h3>
              <button className="text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center">
                <Plus className="w-4 h-4 mr-1" /> Add Action Item
              </button>
            </div>
            <div className="p-6 space-y-2">
              {actionItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className={`mt-1 p-1.5 rounded-full ${item.status === 'Completed' ? 'bg-green-100 text-green-600' :
                        item.priority === 'High' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'
                      }`}>
                      {item.status === 'Completed' ? <CheckSquare className="w-4 h-4" /> : <ClipboardCheck className="w-4 h-4" />}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">{item.title}</h4>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                        <span>Assignee: {item.assignee}</span>
                        <span className="text-gray-300">|</span>
                        <span>Due: {item.due}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${item.priority === 'High' ? 'bg-red-100 text-red-700' :
                        item.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                      }`}>
                      {item.priority}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${item.status === 'Completed' ? 'bg-gray-100 text-gray-600 line-through' : 'bg-blue-50 text-blue-700'
                      }`}>
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-gray-100 text-center">
              <button className="text-sm text-gray-500 hover:text-gray-900 font-medium flex items-center justify-center">
                View All Action Items <ArrowRight className="w-3 h-3 ml-1" />
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-3">
          {/* Meetings Card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Meetings</h3>
            <div className="space-y-2">
              {meetings.map((meeting) => (
                <div key={meeting.id} className={`p-4 rounded-lg border ${meeting.type === 'Upcoming' ? 'border-l-4 border-l-orange-500 bg-orange-50 border-gray-200' : 'border-gray-100 bg-gray-50'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold uppercase text-gray-500">{meeting.date}</span>
                    {meeting.type === 'Upcoming' && <span className="text-xs font-bold text-orange-600 bg-white px-2 py-0.5 rounded">UPCOMING</span>}
                  </div>
                  <h4 className="text-sm font-bold text-gray-900">{meeting.title}</h4>
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                    <Clock className="w-3 h-3" /> {meeting.time}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{meeting.room}</div>
                  {meeting.type === 'Past' && (
                    <button className="mt-3 text-xs text-blue-600 hover:underline font-medium">View Minutes</button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-gradient-to-br from-orange-600 to-red-600 rounded-xl shadow-lg p-3 text-white">
            <h3 className="text-lg font-bold mb-2 flex items-center">
              <MessageSquare className="w-5 h-5 mr-2" />
              Safety Observations
            </h3>
            <div className="space-y-2">
              <div>
                <p className="text-orange-100 text-sm">Open Observations</p>
                <p className="text-3xl font-bold">8</p>
              </div>
              <div>
                <p className="text-orange-100 text-sm">Resolved this month</p>
                <p className="text-3xl font-bold">24</p>
              </div>
              <button className="w-full py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors backdrop-blur-sm">
                Submit Observation
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
