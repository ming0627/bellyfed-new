import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Info,
  Clock,
  Phone,
  Mail,
  Globe,
  Users2,
  Car,
  Wifi,
  CreditCard,
} from 'lucide-react';
import { Schedule, FoodEstablishment } from '@/types';
import { formatTime } from '@/utils/date';

type AboutSectionProps = Pick<
  FoodEstablishment,
  'name' | 'description' | 'schedules' | 'contact' | 'facilities'
>;

interface FormattedSchedule {
  days: string;
  hours: string;
}

function groupSchedules(schedules: Schedule[]): FormattedSchedule[] {
  const daysOrder = [
    'MONDAY',
    'TUESDAY',
    'WEDNESDAY',
    'THURSDAY',
    'FRIDAY',
    'SATURDAY',
    'SUNDAY',
  ];

  return schedules
    .sort(
      (a, b) => daysOrder.indexOf(a.dayOfWeek) - daysOrder.indexOf(b.dayOfWeek),
    )
    .map((schedule) => ({
      days:
        schedule.dayOfWeek.charAt(0) +
        schedule.dayOfWeek.slice(1).toLowerCase(),
      hours: `${formatTime(schedule.startTime)} - ${formatTime(schedule.endTime)}`,
    }));
}

export function AboutSection({
  name,
  description,
  schedules,
  contact,
  facilities,
}: AboutSectionProps): React.ReactElement {
  const formattedSchedules = schedules ? groupSchedules(schedules) : [];

  return (
    <Card className="bg-white shadow-lg">
      <CardHeader>
        <CardTitle className="text-red-600 flex items-center gap-2">
          <Info className="w-5 h-5" />
          About {name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="prose prose-sm max-w-none">
          <p className="text-gray-700 leading-relaxed">{description}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Operating Hours */}
          <div className="bg-orange-50/50 rounded-lg p-4">
            <h4 className="font-semibold text-red-600 flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4" />
              Operating Hours
            </h4>
            <div className="space-y-2 text-sm">
              {formattedSchedules.map(({ days, hours }, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center py-1 border-b last:border-b-0 border-gray-100"
                >
                  <span className="text-gray-600 font-medium w-24">{days}</span>
                  <span className="text-gray-900">{hours}</span>
                </div>
              ))}
              {formattedSchedules.length === 0 && (
                <div className="text-gray-600">
                  Operating hours not available
                </div>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-orange-50/50 rounded-lg p-4">
            <h4 className="font-semibold text-red-600 flex items-center gap-2 mb-3">
              <Phone className="w-4 h-4" />
              Contact Information
            </h4>
            <ul className="space-y-2 text-sm">
              {contact?.phone && (
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span>{contact.phone}</span>
                </li>
              )}
              {contact?.email && (
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span>{contact.email}</span>
                </li>
              )}
              {contact?.website && (
                <li className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-gray-500" />
                  <a
                    href={contact.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {contact.website}
                  </a>
                </li>
              )}
            </ul>
          </div>

          {/* Facilities */}
          <div className="bg-orange-50/50 rounded-lg p-4">
            <h4 className="font-semibold text-red-600 flex items-center gap-2 mb-3">
              <Users2 className="w-4 h-4" />
              Facilities
            </h4>
            <ul className="space-y-2 text-sm">
              {facilities?.seating?.capacity && (
                <li className="flex items-center gap-2">
                  <Users2 className="w-4 h-4 text-gray-500" />
                  <span>Seating Capacity: {facilities.seating.capacity}</span>
                </li>
              )}
              {facilities?.parking?.available && (
                <li className="flex items-center gap-2">
                  <Car className="w-4 h-4 text-gray-500" />
                  <span>
                    Parking Available{' '}
                    {facilities.parking.details &&
                      `(${facilities.parking.details})`}
                  </span>
                </li>
              )}
              {facilities?.wifi?.available && (
                <li className="flex items-center gap-2">
                  <Wifi className="w-4 h-4 text-gray-500" />
                  <span>
                    WiFi Available{' '}
                    {facilities.wifi.details && `(${facilities.wifi.details})`}
                  </span>
                </li>
              )}
              {facilities?.payment?.methods &&
                facilities.payment.methods.length > 0 && (
                  <li className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-gray-500" />
                    <span>
                      Payment Methods: {facilities.payment.methods.join(', ')}
                    </span>
                  </li>
                )}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
