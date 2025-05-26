import { useEffect } from 'react'
import { useToast } from '@chakra-ui/react'
import { useNotificationStore } from '../store/notification.store'

export function NotificationSystem() {
  const toast = useToast()
  const { notifications, removeNotification } = useNotificationStore()

  useEffect(() => {
    notifications.forEach((notification) => {
      toast({
        title: notification.title,
        description: notification.message,
        status: notification.type,
        duration: 5000,
        isClosable: true,
        onCloseComplete: () => removeNotification(notification.id),
      })
    })
  }, [notifications, toast, removeNotification])

  return null
} 