import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout } from '../components/layout';
import { Card, Badge, Button } from '../components/ui';
import { MessageCircle, Search, MoreVertical, Phone, Video, MapPin, Calendar, Star } from 'lucide-react';
import { mockConversations, mockUsers } from '../data/mockData';

const Inbox: React.FC = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);

  // Mock conversations - in real app this would come from API
  const conversations = mockConversations;

  const filteredConversations = conversations.filter(conversation =>
    conversation.property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conversation.participants.some(participant =>
      participant.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const formatTime = (date: string) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffInHours = (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return t('inbox.time.justNow');
    } else if (diffInHours < 24) {
      return t('inbox.time.hoursAgo', { count: Math.floor(diffInHours) });
    } else if (diffInHours < 168) { // 7 days
      return t('inbox.time.daysAgo', { count: Math.floor(diffInHours / 24) });
    } else {
      return messageDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const ConversationItem: React.FC<{ conversation: typeof conversations[0] }> = ({ conversation }) => {
    const otherParticipant = conversation.participants.find(p => p.id !== mockUsers[2].id) || conversation.participants[0];
    const isSelected = selectedConversation === conversation.id;

    return (
      <Link
        to={`/inbox/${conversation.id}`}
        onClick={() => setSelectedConversation(conversation.id)}
        className={`block p-4 hover:bg-warm-gray transition-colors border-b border-gray-100 last:border-b-0 ${
          isSelected ? 'bg-gold/5 border-gold/20' : ''
        }`}
      >
        <div className="flex items-start space-x-4">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <img
              src={otherParticipant.avatar || `https://ui-avatars.com/api/?name=${otherParticipant.name}&background=E5C469&color=0A1A2F`}
              alt={otherParticipant.name}
              className="w-12 h-12 rounded-full object-cover"
            />
            {conversation.unreadCount > 0 && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-xs text-white font-bold">
                  {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                </span>
              </div>
            )}
          </div>

          {/* Conversation Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-semibold text-navy truncate">
                {otherParticipant.name}
              </h3>
              <span className="text-xs text-charcoal flex-shrink-0">
                {conversation.lastMessage ? formatTime(conversation.lastMessage.timestamp) : formatTime(conversation.updatedAt)}
              </span>
            </div>

            <p className="text-sm text-navy font-medium mb-1 truncate">
              {conversation.property.title}
            </p>

            <p className={`text-sm truncate ${
              conversation.unreadCount > 0 ? 'text-navy font-medium' : 'text-charcoal'
            }`}>
              {conversation.lastMessage?.content || t('inbox.noMessagesYet')}
            </p>

            {/* Property Quick Info */}
            <div className="flex items-center space-x-3 mt-2 text-xs text-charcoal">
              <div className="flex items-center space-x-1">
                <MapPin className="h-3 w-3" />
                <span>{conversation.property.location}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Star className="h-3 w-3 fill-gold text-gold" />
                <span>{conversation.property.rating}</span>
              </div>
              <div className="text-gold font-medium">
                ${conversation.property.price}/night
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <button className="p-1 hover:bg-gray-100 rounded-full">
              <MoreVertical className="h-4 w-4 text-gray-400" />
            </button>
          </div>
        </div>
      </Link>
    );
  };

  return (
    <Layout>
      <div className="py-12 px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-thin text-navy mb-2">
              <span className="font-bold text-gold">{t('inbox.title')}</span>
            </h1>
            <p className="text-xl text-charcoal">
              {t('inbox.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Conversations List */}
            <div className="lg:col-span-1">
              <Card variant="default" className="h-fit">
                {/* Search */}
                <div className="p-4 border-b border-gray-100">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder={t('inbox.searchPlaceholder')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold text-sm"
                    />
                  </div>
                </div>

                {/* Conversations */}
                <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                  {filteredConversations.length === 0 ? (
                    <div className="p-8 text-center">
                      <MessageCircle className="h-12 w-12 text-gold mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-navy mb-2">{t('inbox.noConversationsFound')}</h3>
                      <p className="text-charcoal text-sm">
                        {searchQuery ? t('inbox.noConversationsMessage') : t('inbox.noConversationsEmpty')}
                      </p>
                    </div>
                  ) : (
                    filteredConversations.map((conversation) => (
                      <ConversationItem key={conversation.id} conversation={conversation} />
                    ))
                  )}
                </div>

                {/* Stats */}
                <div className="p-4 bg-warm-gray border-t border-gray-100">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-charcoal">{t('inbox.totalConversations')}</span>
                    <Badge variant="default" className="bg-gold text-navy">
                      {conversations.length}
                    </Badge>
                  </div>
                </div>
              </Card>
            </div>

            {/* Chat Preview or Empty State */}
            <div className="lg:col-span-2">
              {selectedConversation ? (
                <Card variant="default" className="h-[600px] flex flex-col">
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <img
                          src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=50&h=50&fit=crop&crop=face"
                          alt="Host"
                          className="w-12 h-12 rounded-full"
                        />
                        <div>
                          <h3 className="font-semibold text-navy">Anna Svensson</h3>
                          <p className="text-sm text-charcoal">Seaside Villa Paradise</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Phone className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Video className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 p-6 overflow-y-auto">
                    <div className="space-y-4">
                      {/* Sample Messages */}
                      <div className="flex justify-start">
                        <div className="bg-warm-gray rounded-2xl rounded-tl-md px-4 py-2 max-w-xs">
                          <p className="text-sm">Hi Elena! I'm excited to welcome you to my seaside villa. Do you have any questions about the property?</p>
                          <span className="text-xs text-charcoal mt-1 block">2 hours ago</span>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <div className="bg-gold text-navy rounded-2xl rounded-tr-md px-4 py-2 max-w-xs">
                          <p className="text-sm">Hello Anna! The photos look amazing. Could you tell me more about the beach access?</p>
                          <span className="text-xs text-navy/70 mt-1 block">1 hour ago</span>
                        </div>
                      </div>

                      <div className="flex justify-start">
                        <div className="bg-warm-gray rounded-2xl rounded-tl-md px-4 py-2 max-w-xs">
                          <p className="text-sm">Absolutely! The villa has direct access to a private beach area. There are also kayaks available for your use.</p>
                          <span className="text-xs text-charcoal mt-1 block">30 minutes ago</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border-t border-gray-100">
                    <div className="flex space-x-3">
                      <input
                        type="text"
                        placeholder={t('inbox.typeMessage')}
                        className="flex-1 px-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold"
                      />
                      <Button variant="primary" size="sm">
                        {t('inbox.send')}
                      </Button>
                    </div>
                  </div>
                </Card>
              ) : (
                <Card variant="default" className="h-[600px] flex items-center justify-center">
                  <div className="text-center">
                    <MessageCircle className="h-16 w-16 text-gold mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-navy mb-2">{t('inbox.selectConversation')}</h3>
                    <p className="text-charcoal">
                      {t('inbox.selectConversationMessage')}
                    </p>
                  </div>
                </Card>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <Card variant="default" className="p-6 mt-8 bg-gradient-to-r from-gold/5 to-navy/5 border-gold/20">
            <h3 className="text-lg font-semibold text-navy mb-4">{t('inbox.communicationTips.title')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <MessageCircle className="h-6 w-6 text-gold" />
                </div>
                <h4 className="font-medium text-navy mb-2">{t('inbox.communicationTips.beClear.title')}</h4>
                <p className="text-sm text-charcoal">
                  {t('inbox.communicationTips.beClear.description')}
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Calendar className="h-6 w-6 text-gold" />
                </div>
                <h4 className="font-medium text-navy mb-2">{t('inbox.communicationTips.confirmDetails.title')}</h4>
                <p className="text-sm text-charcoal">
                  {t('inbox.communicationTips.confirmDetails.description')}
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Star className="h-6 w-6 text-gold" />
                </div>
                <h4 className="font-medium text-navy mb-2">{t('inbox.communicationTips.leaveReviews.title')}</h4>
                <p className="text-sm text-charcoal">
                  {t('inbox.communicationTips.leaveReviews.description')}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Inbox;
