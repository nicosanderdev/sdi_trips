import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Layout } from '../components/layout';
import { Card, Badge, Button } from '../components/ui';
import { MessageCircle, Search, MoreVertical, Phone, Video, MapPin, Calendar, Star, Users } from 'lucide-react';
import type { Conversation, Message, Property } from '../types';
import { getGuestInboxThreads, markThreadMessagesAsRead } from '../services/messageService';
import { useChatThread } from '../hooks/useChatThread';
import { getPropertyById } from '../services/propertyService';

const Inbox: React.FC = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeProperty, setActiveProperty] = useState<Property | null>(null);

  const {
    conversation: activeConversation,
    messages,
    isLoading: isThreadLoading,
    error: threadError,
    newMessage,
    setNewMessage,
    messagesEndRef,
    handleSendMessage,
    handleKeyPress,
  } = useChatThread(selectedConversation);

  useEffect(() => {
    let isMounted = true;

    const loadConversations = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getGuestInboxThreads();
        if (isMounted) {
          setConversations(data);
        }
      } catch (err) {
        console.error('Failed to load inbox conversations', err);
        if (isMounted) {
          setError(t('common.error.generic'));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadConversations();

    return () => {
      isMounted = false;
    };
  }, [t]);

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

  const formatMessageTime = (date: string) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatMessageDate = (date: string) => {
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
        year:
          messageDate.getFullYear() !== today.getFullYear()
            ? 'numeric'
            : undefined,
      });
    }
  };

  const groupedMessages = messages.reduce(
    (groups: Record<string, Message[]>, message) => {
      const date = formatMessageDate(message.timestamp);
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
      return groups;
    },
    {},
  );

  const totalUnread = conversations.reduce(
    (sum, conversation) => sum + (conversation.unreadCount ?? 0),
    0,
  );

  const quickTemplates = [
    'chatDetail.quickTemplates.askCapacity',
    'chatDetail.quickTemplates.closestWarehouse',
    'chatDetail.quickTemplates.interestedInDates',
    'chatDetail.quickTemplates.paymentMethods',
    'chatDetail.quickTemplates.depositConfirmation',
  ] as const;

  useEffect(() => {
    let isMounted = true;

    if (!activeConversation) {
      setActiveProperty(null);
      return;
    }

    const loadProperty = async () => {
      try {
        const fullProperty = await getPropertyById(activeConversation.property.id);
        if (isMounted) {
          setActiveProperty(fullProperty);
        }
      } catch (err) {
        console.error('Failed to load full property for conversation', err);
      }
    };

    loadProperty();

    return () => {
      isMounted = false;
    };
  }, [activeConversation]);

  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversation(conversationId);
    setConversations((prev) =>
      prev.map((conversation) =>
        conversation.id === conversationId
          ? { ...conversation, unreadCount: 0 }
          : conversation,
      ),
    );

    markThreadMessagesAsRead(conversationId).catch((err) => {
      console.error('Failed to mark thread messages as read', err);
    });
  };

  const ConversationItem: React.FC<{ conversation: Conversation }> = ({ conversation }) => {
    const otherParticipant = conversation.participants[0];
    const isSelected = selectedConversation === conversation.id;

    return (
      <button
        type="button"
        onClick={() => handleSelectConversation(conversation.id)}
        className={`w-full text-left p-4 hover:bg-warm-gray transition-colors border-b border-gray-100 last:border-b-0 ${
          isSelected ? 'bg-gold/5 border-gold/20' : ''
        }`}
      >
        <div className="flex items-start space-x-4">
          {/* Avatar */}
          <div className="relative shrink-0">
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
              <span className="text-xs text-charcoal shrink-0">
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
              <div className="text-blue-950 font-medium">
                ${conversation.property.price}/night
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <button className="p-1 hover:bg-gray-100 rounded-full">
              <MoreVertical className="h-4 w-4 text-gray-400" />
            </button>
          </div>
        </div>
      </button>
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
                  {isLoading ? (
                    <div className="p-8 text-center">
                      <p className="text-charcoal text-sm">{t('common.loading')}</p>
                    </div>
                  ) : error ? (
                    <div className="p-8 text-center">
                      <p className="text-red-600 text-sm">{error}</p>
                    </div>
                  ) : filteredConversations.length === 0 ? (
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
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>{t('inbox.totalUnread')}</span>
                      <Badge
                        variant="default"
                        className={`text-white ${
                          totalUnread > 0 ? 'bg-red-500' : 'bg-gray-400'
                        }`}
                        aria-label={t('inbox.totalUnread')}
                      >
                        {totalUnread}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>{t('inbox.totalConversations')}</span>
                      <Badge variant="default" className="text-white">
                        {conversations.length}
                      </Badge>
                    </div>
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
                        {activeConversation && (
                          <>
                            <img
                              src={
                                activeConversation.participants[0]?.avatar ||
                                `https://ui-avatars.com/api/?name=${activeConversation.participants[0]?.name}&background=E5C469&color=0A1A2F`
                              }
                              alt={activeConversation.participants[0]?.name}
                              className="w-12 h-12 rounded-full"
                            />
                            <div>
                              <h3 className="font-semibold text-navy">
                                {activeConversation.participants[0]?.name}
                              </h3>
                              <p className="text-sm text-charcoal">
                                {activeConversation.property.title}
                              </p>
                              <div className="flex items-center space-x-3 mt-1 text-xs text-charcoal">
                                <div className="flex items-center space-x-1">
                                  <MapPin className="h-3 w-3" />
                                  <span>{activeConversation.property.location}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Star className="h-3 w-3 fill-gold text-gold" />
                                  <span>{activeConversation.property.rating}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Users className="h-3 w-3" />
                                  <span>
                                    {t('chatDetail.aboutProperty.upToGuests', {
                                      count: activeConversation.property.maxGuests,
                                    })}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        {(() => {
                          const callPhone =
                            activeProperty?.host.phone ||
                            activeConversation?.participants[0]?.phone;

                          if (callPhone) {
                            return (
                              <a
                                href={`tel:${callPhone}`}
                                aria-label={t('chatDetail.call')}
                              >
                                <Button variant="outline" size="sm">
                                  <Phone className="h-4 w-4" />
                                </Button>
                              </a>
                            );
                          }

                          return (
                            <Button
                              variant="outline"
                              size="sm"
                              disabled
                              aria-label={t('chatDetail.call')}
                            >
                              <Phone className="h-4 w-4 opacity-50" />
                            </Button>
                          );
                        })()}
                        <Button
                          variant="outline"
                          size="sm"
                          aria-label={t('chatDetail.video')}
                          disabled
                        >
                          <Video className="h-4 w-4 opacity-50" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 mx-4 my-3 px-4 py-3 overflow-y-auto space-y-6 bg-warm-gray-light rounded-2xl border border-gray-100">
                    {threadError && (
                      <p className="text-sm text-red-600">{threadError}</p>
                    )}

                    {isThreadLoading && messages.length === 0 ? (
                      <p className="text-sm text-charcoal">
                        {t('common.loading')}
                      </p>
                    ) : (
                      Object.entries(groupedMessages).map(([date, messagesForDate]) => (
                        <div key={date}>
                          <div className="flex items-center justify-center mb-4">
                            <div className="bg-white px-3 py-1 rounded-full border border-gray-200 text-sm text-charcoal font-medium">
                              {date}
                            </div>
                          </div>

                          <div className="space-y-4">
                            {messagesForDate.map((message) => {
                              const isCurrentUser = message.read === false;
                              return (
                                <div
                                  key={message.id}
                                  className={`flex ${
                                    isCurrentUser ? 'justify-end' : 'justify-start'
                                  }`}
                                >
                                  <div
                                    className={`flex space-x-3 max-w-xs lg:max-w-md ${
                                      isCurrentUser
                                        ? 'flex-row-reverse space-x-reverse'
                                        : ''
                                    }`}
                                  >
                                    <img
                                      src={
                                        message.sender.avatar ||
                                        `https://ui-avatars.com/api/?name=${message.sender.name}&background=E5C469&color=0A1A2F`
                                      }
                                      alt={message.sender.name}
                                      className="w-8 h-8 rounded-full shrink-0"
                                    />

                                    <div
                                      className={`rounded-2xl px-4 py-2 ${
                                        isCurrentUser
                                          ? 'bg-gold text-navy rounded-tr-md'
                                          : 'bg-warm-gray text-charcoal rounded-tl-md'
                                      }`}
                                    >
                                      <p className="text-sm leading-relaxed">
                                        {message.content}
                                      </p>
                                      <span
                                        className={`text-xs mt-1 block ${
                                          isCurrentUser
                                            ? 'text-navy/70'
                                            : 'text-charcoal/70'
                                        }`}
                                      >
                                        {formatMessageTime(message.timestamp)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))
                    )}

                    <div ref={messagesEndRef} />
                  </div>

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
                          <MessageCircle className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2 text-xs text-charcoal">
                      {quickTemplates.map((key) => (
                        <button
                          key={key}
                          type="button"
                          className="px-3 py-1 rounded-full border border-gray-200 hover:bg-gold/10 hover:border-gold transition-colors"
                          onClick={() => {
                            const template = t(key);
                            setNewMessage((prev) =>
                              prev ? `${prev.trim()}\n${template}` : template,
                            );
                          }}
                        >
                          {t(key)}
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center justify-end mt-3 text-sm text-charcoal">
                      <span className="text-xs">
                        {t('chatDetail.pressEnterToSend')}
                      </span>
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
          <Card variant="default" className="p-6 mt-8 bg-linear-to-r from-gold/5 to-navy/5 border-gold/20">
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
