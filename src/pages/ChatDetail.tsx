import React, { useState, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout } from '../components/layout';
import { Card, Button, Badge } from '../components/ui';
import { ArrowLeft, Phone, Video, MoreVertical, Send, MapPin, Star, Calendar, Users } from 'lucide-react';
import { mockConversations, mockMessages, mockUsers } from '../data/mockData';

const ChatDetail: React.FC = () => {
  const { t } = useTranslation();
  const { conversationId } = useParams<{ conversationId: string }>();
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Find the conversation and its messages
  const conversation = mockConversations.find(c => c.id === conversationId);
  const conversationMessages = mockMessages.filter(m => m.conversationId === conversationId);

  // Mock current user
  const currentUser = mockUsers[2]; // Elena Rodriguez

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversationMessages]);

  if (!conversation) {
    return (
      <Layout>
        <div className="py-12 px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl font-semibold text-navy mb-4">{t('chatDetail.conversationNotFound')}</h1>
            <Link to="/inbox">
              <Button variant="primary">{t('chatDetail.backToInbox')}</Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const otherParticipant = conversation.participants.find(p => p.id !== currentUser.id) || conversation.participants[0];

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // In real app, this would send the message to the API
      console.log('Sending message:', newMessage);
      setNewMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date: string) => {
    const messageDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) {
      return t('chatDetail.today');
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return t('chatDetail.yesterday');
    } else {
      return messageDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: messageDate.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  // Group messages by date
  const groupedMessages = conversationMessages.reduce((groups, message) => {
    const date = formatDate(message.timestamp);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {} as Record<string, typeof conversationMessages>);

  return (
    <Layout>
      <div className="py-12 px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Link to="/inbox" className="inline-flex items-center space-x-2 text-charcoal hover:text-navy transition-colors mb-4">
              <ArrowLeft className="h-4 w-4" />
              <span>{t('chatDetail.backToInbox')}</span>
            </Link>

            <Card variant="default" className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <img
                    src={otherParticipant.avatar || `https://ui-avatars.com/api/?name=${otherParticipant.name}&background=E5C469&color=0A1A2F`}
                    alt={otherParticipant.name}
                    className="w-16 h-16 rounded-full"
                  />
                  <div>
                    <h1 className="text-2xl font-semibold text-navy">{otherParticipant.name}</h1>
                    <p className="text-charcoal">{conversation.property.title}</p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-charcoal">
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4" />
                        <span>{conversation.property.location}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 fill-gold text-gold" />
                        <span>{conversation.property.rating}</span>
                      </div>
                      <Badge variant="default" className="bg-gold text-navy">
                        ${conversation.property.price}/night
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Button variant="outline" size="sm">
                    <Phone className="h-4 w-4 mr-2" />
                    {t('chatDetail.call')}
                  </Button>
                  <Button variant="outline" size="sm">
                    <Video className="h-4 w-4 mr-2" />
                    {t('chatDetail.video')}
                  </Button>
                  <button className="p-2 hover:bg-gray-100 rounded-full">
                    <MoreVertical className="h-5 w-5 text-gray-400" />
                  </button>
                </div>
              </div>
            </Card>
          </div>

          {/* Chat Container */}
          <Card variant="default" className="h-[600px] flex flex-col">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {Object.entries(groupedMessages).map(([date, messages]) => (
                <div key={date}>
                  {/* Date Separator */}
                  <div className="flex items-center justify-center mb-4">
                    <div className="bg-white px-3 py-1 rounded-full border border-gray-200 text-sm text-charcoal font-medium">
                      {date}
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="space-y-4">
                    {messages.map((message) => {
                      const isCurrentUser = message.sender.id === currentUser.id;
                      return (
                        <div key={message.id} className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                          <div className={`flex space-x-3 max-w-xs lg:max-w-md ${isCurrentUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
                            {/* Avatar */}
                            <img
                              src={message.sender.avatar || `https://ui-avatars.com/api/?name=${message.sender.name}&background=E5C469&color=0A1A2F`}
                              alt={message.sender.name}
                              className="w-8 h-8 rounded-full flex-shrink-0"
                            />

                            {/* Message Bubble */}
                            <div className={`rounded-2xl px-4 py-2 ${
                              isCurrentUser
                                ? 'bg-gold text-navy rounded-tr-md'
                                : 'bg-warm-gray text-charcoal rounded-tl-md'
                            }`}>
                              <p className="text-sm leading-relaxed">{message.content}</p>
                              <span className={`text-xs mt-1 block ${
                                isCurrentUser ? 'text-navy/70' : 'text-charcoal/70'
                              }`}>
                                {formatTime(message.timestamp)}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Typing Indicator (could be shown when other user is typing) */}
              <div className="flex justify-start">
                <div className="bg-warm-gray rounded-2xl rounded-tl-md px-4 py-2 max-w-xs">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-charcoal/50 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-charcoal/50 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-charcoal/50 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>

              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-100">
              <div className="flex space-x-3">
                <div className="flex-1 relative">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={t('chatDetail.typeMessage')}
                    rows={1}
                    className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold resize-none max-h-32"
                    style={{ minHeight: '44px' }}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full transition-colors ${
                      newMessage.trim()
                        ? 'text-gold hover:bg-gold/10'
                        : 'text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center justify-between mt-3 text-sm text-charcoal">
                <div className="flex space-x-4">
                  <button className="hover:text-gold transition-colors">
                    {t('chatDetail.quickActions.suggestDates')}
                  </button>
                  <button className="hover:text-gold transition-colors">
                    {t('chatDetail.quickActions.changeGuestCount')}
                  </button>
                  <button className="hover:text-gold transition-colors">
                    {t('chatDetail.quickActions.askAboutAmenities')}
                  </button>
                </div>
                <span className="text-xs">{t('chatDetail.pressEnterToSend')}</span>
              </div>
            </div>
          </Card>

          {/* Property Quick Info */}
          <Card variant="default" className="p-6 mt-6 bg-gradient-to-r from-gold/5 to-navy/5 border-gold/20">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-navy mb-2">{t('chatDetail.aboutProperty.title')}</h3>
                <div className="flex items-center space-x-6 text-sm text-charcoal">
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>{t('chatDetail.aboutProperty.upToGuests', { count: conversation.property.maxGuests })}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>{t('chatDetail.aboutProperty.flexibleCancellation')}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 fill-gold text-gold" />
                    <span>{t('chatDetail.aboutProperty.rating', { rating: conversation.property.rating })}</span>
                  </div>
                </div>
              </div>
              <Link to={`/property/${conversation.property.id}`}>
                <Button variant="outline" size="sm">
                  {t('chatDetail.aboutProperty.viewProperty')}
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default ChatDetail;
