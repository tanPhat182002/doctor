'use client'

import { useState, useMemo, useCallback } from 'react'
import { Calendar, momentLocalizer, View, Views } from 'react-big-calendar'
import moment from 'moment'
import 'moment/locale/vi'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { Button } from '@/components/ui/button'
import { Plus, Calendar as CalendarIcon } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

// Setup the localizer
const localizer = momentLocalizer(moment)

// Configure Vietnamese locale for moment
moment.locale('vi', {
  months: [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ],
  monthsShort: [
    'T1', 'T2', 'T3', 'T4', 'T5', 'T6',
    'T7', 'T8', 'T9', 'T10', 'T11', 'T12'
  ],
  weekdays: ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'],
  weekdaysShort: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
  weekdaysMin: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']
})

interface AppointmentEvent {
  id: number
  title: string
  start: Date
  end: Date
  resource: {
    id: number
    maHoSo: string
    tenThu: string
    loai: string
    trangThaiKham: string
    khachHang: {
      tenKhachHang: string
      soDienThoai: string
    }
    ghiChu?: string
  }
}

interface AppointmentCalendarProps {
  appointments: AppointmentEvent[]
  onSelectEvent?: (event: AppointmentEvent) => void
  onSelectSlot?: (slotInfo: { start: Date; end: Date }) => void
  className?: string
}

// Status configuration
const statusConfig = {
  'CHUA_KHAM': {
    label: 'Chưa khám',
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    dotClass: 'bg-yellow-500'
  },
  'DA_KHAM': {
    label: 'Đã khám',
    className: 'bg-green-100 text-green-800 border-green-200',
    dotClass: 'bg-green-500'
  },
  'HUY': {
    label: 'Đã hủy',
    className: 'bg-red-100 text-red-800 border-red-200',
    dotClass: 'bg-red-500'
  },
  'HOAN': {
    label: 'Hoãn',
    className: 'bg-orange-100 text-orange-800 border-orange-200',
    dotClass: 'bg-orange-500'
  }
}

// Custom Event Component
function EventComponent({ event }: { event: AppointmentEvent }) {
  const eventStatus = statusConfig[event.resource.trangThaiKham as keyof typeof statusConfig]
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
  const isFollowUp = event.title.includes('[Tái khám]')
  
  return (
    <div className={cn('p-1 text-white rounded', isMobile ? 'text-xs' : 'text-xs')}>
      <div className="font-medium truncate">
        {isMobile ? event.resource.tenThu.substring(0, 8) + (event.resource.tenThu.length > 8 ? '...' : '') : event.resource.tenThu}
        {isFollowUp && <span className="ml-1 text-xs">🔄</span>}
      </div>
      {!isMobile && (
        <div className="text-gray-100 truncate text-xs">
          {event.resource.khachHang.tenKhachHang}
        </div>
      )}
      <div className="text-xs opacity-90">
        {moment(event.start).format('HH:mm')}
      </div>
    </div>
  )
}

// Custom Toolbar Component
function CustomToolbar({ label, onNavigate, onView, view }: any) {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
  
  return (
    <div className="flex flex-col gap-3 p-3 sm:p-4 border-b bg-gray-50">
      {/* Navigation and Title Row */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-1 sm:gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate('PREV')}
            className="px-2 py-1 text-xs sm:px-3 sm:text-sm"
          >
            ←
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate('TODAY')}
            className="px-2 py-1 text-xs sm:px-3 sm:text-sm"
          >
            {isMobile ? 'Hôm nay' : 'Hôm nay'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate('NEXT')}
            className="px-2 py-1 text-xs sm:px-3 sm:text-sm"
          >
            →
          </Button>
        </div>
        
        <h2 className="text-sm sm:text-lg font-semibold text-gray-900 text-center flex-1 mx-2">
          {label}
        </h2>
      </div>
      
      {/* View Buttons Row */}
      <div className="flex gap-1 justify-center">
        <Button
          variant={view === Views.MONTH ? 'default' : 'outline'}
          size="sm"
          onClick={() => onView(Views.MONTH)}
          className="px-2 py-1 text-xs sm:px-3 sm:text-sm flex-1 sm:flex-none"
        >
          Tháng
        </Button>
        {!isMobile && (
          <Button
            variant={view === Views.WEEK ? 'default' : 'outline'}
            size="sm"
            onClick={() => onView(Views.WEEK)}
            className="px-2 py-1 text-xs sm:px-3 sm:text-sm"
          >
            Tuần
          </Button>
        )}
        <Button
          variant={view === Views.DAY ? 'default' : 'outline'}
          size="sm"
          onClick={() => onView(Views.DAY)}
          className="px-2 py-1 text-xs sm:px-3 sm:text-sm flex-1 sm:flex-none"
        >
          Ngày
        </Button>
        <Button
          variant={view === Views.AGENDA ? 'default' : 'outline'}
          size="sm"
          onClick={() => onView(Views.AGENDA)}
          className="px-2 py-1 text-xs sm:px-3 sm:text-sm flex-1 sm:flex-none"
        >
          {isMobile ? 'Danh sách' : 'Lịch trình'}
        </Button>
      </div>
    </div>
  )
}

// Custom messages in Vietnamese
const messages = {
  date: 'Ngày',
  time: 'Thời gian',
  event: 'Sự kiện',
  allDay: 'Cả ngày',
  week: 'Tuần',
  work_week: 'Tuần làm việc',
  day: 'Ngày',
  month: 'Tháng',
  previous: 'Trước',
  next: 'Tiếp',
  yesterday: 'Hôm qua',
  tomorrow: 'Ngày mai',
  today: 'Hôm nay',
  agenda: 'Lịch trình',
  noEventsInRange: 'Không có lịch khám nào trong khoảng thời gian này.',
  showMore: (total: number) => `+${total} lịch khám khác`
}

export function AppointmentCalendar({ 
  appointments, 
  onSelectEvent, 
  onSelectSlot,
  className 
}: AppointmentCalendarProps) {
  const [view, setView] = useState<View>(Views.MONTH)
  const [date, setDate] = useState(new Date())

  // Memoize events to prevent unnecessary re-renders
  const events = useMemo(() => {
    return appointments.map(appointment => ({
      ...appointment,
      start: new Date(appointment.start),
      end: new Date(appointment.end)
    }))
  }, [appointments])

  // Memoize components
  const components = useMemo(() => ({
    event: EventComponent,
    toolbar: CustomToolbar
  }), [])

  const handleSelectEvent = useCallback((event: AppointmentEvent) => {
    onSelectEvent?.(event)
  }, [onSelectEvent])

  const handleSelectSlot = useCallback((slotInfo: { start: Date; end: Date }) => {
    onSelectSlot?.(slotInfo)
  }, [onSelectSlot])

  const handleNavigate = useCallback((newDate: Date) => {
    setDate(newDate)
  }, [])

  const handleViewChange = useCallback((newView: View) => {
    setView(newView)
  }, [])

  return (
    <div className={cn('bg-white rounded-lg border border-gray-200', className)}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Lịch Tái Khám</h2>
          </div>
          <Link href="/admin/lich-kham/them-moi">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Thêm lịch khám
            </Button>
          </Link>
        </div>

        <div style={{ height: typeof window !== 'undefined' && window.innerWidth < 768 ? '400px' : '600px' }}>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            titleAccessor="title"
            view={view}
            date={date}
            onNavigate={handleNavigate}
            onView={handleViewChange}
            onSelectEvent={handleSelectEvent}
            onSelectSlot={handleSelectSlot}
            selectable
            popup
            components={components}
            messages={messages}
            step={30}
            timeslots={2}
            min={new Date(2024, 0, 1, 8, 0)} // 8:00 AM
            max={new Date(2024, 0, 1, 18, 0)} // 6:00 PM
            views={typeof window !== 'undefined' && window.innerWidth < 768 ? [Views.MONTH, Views.DAY, Views.AGENDA] : [Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
            formats={{
              timeGutterFormat: 'HH:mm',
              eventTimeRangeFormat: ({ start, end }: { start: Date; end: Date }, culture?: string, localizer?: any) =>
                localizer?.format(start, 'HH:mm', culture) + ' - ' + localizer?.format(end, 'HH:mm', culture) || `${moment(start).format('HH:mm')} - ${moment(end).format('HH:mm')}`,
              agendaTimeFormat: 'HH:mm',
              agendaTimeRangeFormat: ({ start, end }: { start: Date; end: Date }, culture?: string, localizer?: any) =>
                localizer?.format(start, 'HH:mm', culture) + ' - ' + localizer?.format(end, 'HH:mm', culture) || `${moment(start).format('HH:mm')} - ${moment(end).format('HH:mm')}`
            }}
            eventPropGetter={(event) => {
              const isFollowUp = event.title.includes('[Tái khám]')
              
              let backgroundColor = '#3b82f6' // default blue
              let borderColor = '#2563eb'
              
              if (isFollowUp) {
                backgroundColor = '#8b5cf6' // purple for follow-up
                borderColor = '#7c3aed'
              } else {
                switch (event.resource.trangThaiKham) {
                  case 'CHUA_KHAM':
                    backgroundColor = '#f59e0b' // yellow
                    borderColor = '#d97706'
                    break
                  case 'DA_KHAM':
                    backgroundColor = '#10b981' // green
                    borderColor = '#059669'
                    break
                  case 'HUY':
                  case 'HOAN':
                    backgroundColor = '#ef4444' // red
                    borderColor = '#dc2626'
                    break
                }
              }
              
              return {
                style: {
                  backgroundColor,
                  borderColor,
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: typeof window !== 'undefined' && window.innerWidth < 768 ? '10px' : '12px'
                }
              }
            }}
          />
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center gap-4 text-sm">
          <span className="text-gray-600">Trạng thái:</span>
          {Object.entries(statusConfig).map(([key, config]) => (
            <div key={key} className="flex items-center gap-1">
              <div className={cn('w-3 h-3 rounded-full', config.dotClass)} />
              <span className="text-gray-700">{config.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}