'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { BlogSidebarProps } from '@/types';
import {
    Calendar,
    ChevronLeft,
    ChevronRight,
    Clock3,
    Trash2,
} from 'lucide-react';

const WEEK_DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const getNow = () => new Date();

const formatInputDateTime = (date: Date) => {
    const pad = (value: number) => String(value).padStart(2, '0');

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const parseInputDateTime = (value?: string) => {
    if (!value) return null;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const startOfDay = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate());

const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

const clampPublishDate = (
    date: Date,
    globalStatus: 'draft' | 'publish' | 'future',
    now: Date,
) => {
    if (globalStatus === 'future' && date < now) {
        return now;
    }

    if (globalStatus === 'publish' && date > now) {
        return now;
    }

    return date;
};

const getCalendarDays = (monthDate: Date) => {
    const start = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
    const end = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
    const days: Array<Date | null> = [];

    for (let i = 0; i < start.getDay(); i += 1) {
        days.push(null);
    }

    for (let day = 1; day <= end.getDate(); day += 1) {
        days.push(new Date(monthDate.getFullYear(), monthDate.getMonth(), day));
    }

    return days;
};

const HOUR_OPTIONS = Array.from({ length: 12 }, (_, index) => String(index + 1));
const MINUTE_OPTIONS = Array.from({ length: 60 }, (_, index) =>
    String(index).padStart(2, '0'),
);
const PERIOD_OPTIONS = ['AM', 'PM'] as const;

const get24HourTime = (hour12: string, minute: string, period: 'AM' | 'PM') => {
    const parsedHour = Number(hour12);
    let hour24 = parsedHour % 12;

    if (period === 'PM') {
        hour24 += 12;
    }

    return `${String(hour24).padStart(2, '0')}:${minute}`;
};

const formatDisplayValue = (value: string) => {
    const date = parseInputDateTime(value);
    if (!date) return 'Select publish date & time';

    return date.toLocaleString([], {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });
};

const BlogSidebar = ({
    register,
    publishDate,
    categories,
    category,
    setValue,
    image,
    handleRemoveImage,
    setIsCategoryModalOpen,
    setIsUploadModalOpen,
    setMediaFor,
    globalStatus,
    blogId,
}: BlogSidebarProps) => {
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const [currentLocalDateTime, setCurrentLocalDateTime] = useState(formatInputDateTime(getNow()));
    const pickerRef = useRef<HTMLDivElement>(null);
    const disabledPicker = blogId !== null && globalStatus === 'publish';

    const now = useMemo(
        () => parseInputDateTime(currentLocalDateTime) || getNow(),
        [currentLocalDateTime],
    );
    const selectedDateTime = parseInputDateTime(publishDate) || now;
    const selectedDate = startOfDay(selectedDateTime);
    const selectedTime = publishDate?.slice(11, 16) || currentLocalDateTime.slice(11, 16);
    const selectedHour24 = selectedDateTime.getHours();
    const selectedMinute = String(selectedDateTime.getMinutes()).padStart(2, '0');
    const selectedPeriod = selectedHour24 >= 12 ? 'PM' : 'AM';
    const selectedHour12 = String(selectedHour24 % 12 || 12);

    const [visibleMonth, setVisibleMonth] = useState(
        new Date(selectedDateTime.getFullYear(), selectedDateTime.getMonth(), 1),
    );

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentLocalDateTime(formatInputDateTime(getNow()));
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        setVisibleMonth(
            new Date(selectedDateTime.getFullYear(), selectedDateTime.getMonth(), 1),
        );
    }, [
        publishDate,
        selectedDateTime.getFullYear(),
        selectedDateTime.getMonth(),
    ]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (!pickerRef.current?.contains(event.target as Node)) {
                setIsPickerOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (!publishDate) return;

        const parsed = parseInputDateTime(publishDate);
        if (!parsed) return;

        const clamped = clampPublishDate(parsed, globalStatus, now);
        const nextValue = formatInputDateTime(clamped);

        if (nextValue !== publishDate) {
            setValue('publishDate', nextValue, {
                shouldDirty: true,
                shouldValidate: true,
            });
        }
    }, [globalStatus, now, publishDate, setValue]);

    const hiddenPublishDateRegister = register('publishDate');
    const calendarDays = useMemo(() => getCalendarDays(visibleMonth), [visibleMonth]);

    const isDateDisabled = (date: Date) => {
        const today = startOfDay(now);

        if (globalStatus === 'future') {
            return date < today;
        }

        if (globalStatus === 'publish') {
            return date > today;
        }

        return false;
    };

    const isHourDisabled = (hour12: string) =>
        PERIOD_OPTIONS.every((period) =>
            MINUTE_OPTIONS.every((minute) =>
                isTimeDisabled(get24HourTime(hour12, minute, period)),
            ),
        );

    const isMinuteDisabled = (minute: string) =>
        isTimeDisabled(get24HourTime(selectedHour12, minute, selectedPeriod));

    const isPeriodDisabled = (period: 'AM' | 'PM') =>
        HOUR_OPTIONS.every((hour12) =>
            isTimeDisabled(get24HourTime(hour12, selectedMinute, period)),
        );

    const isTimeDisabled = (time: string) => {
        const [hours, minutes] = time.split(':').map(Number);
        const candidate = new Date(selectedDate);
        candidate.setHours(hours, minutes, 0, 0);

        if (globalStatus === 'future') {
            return candidate < now;
        }

        if (globalStatus === 'publish') {
            return candidate > now;
        }

        return false;
    };

    const updatePublishDate = (nextDate: Date, nextTime: string) => {
        const [hours, minutes] = nextTime.split(':').map(Number);
        const combined = new Date(nextDate);
        combined.setHours(hours, minutes, 0, 0);

        const clamped = clampPublishDate(combined, globalStatus, getNow());
        setValue('publishDate', formatInputDateTime(clamped), {
            shouldDirty: true,
            shouldValidate: true,
        });
    };

    return (
        <>
            <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6 glass-card">
                    <h3 className="font-semibold text-white flex items-center gap-2">
                        Publishing Settings
                    </h3>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Global Status</label>
                            <select
                                {...register('globalStatus')}
                                className="w-full px-3 py-2 bg-slate-50 text-black rounded-lg focus:outline-none text-sm"
                            >
                                <option value="draft" className="text-black">Draft</option>
                                <option value="future" className="text-black">Scheduled</option>
                                <option value="publish" className="text-black">Published</option>
                            </select>
                        </div>

                        <div className="space-y-2" ref={pickerRef}>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Publish Date</label>
                            <input type="hidden" {...hiddenPublishDateRegister} />

                            <button
                                type="button"
                                disabled={disabledPicker}
                                onClick={() => setIsPickerOpen((prev) => !prev)}
                                className={`w-full px-3 py-2 border rounded-lg text-black text-sm flex items-center justify-between gap-3 ${disabledPicker
                                    ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                                    : 'bg-slate-50 border-slate-200'
                                    }`}
                            >
                                <span className="flex items-center gap-2">
                                    <Calendar size={16} className="text-slate-500" />
                                    <span>{formatDisplayValue(publishDate)}</span>
                                </span>
                                <Clock3 size={16} className="text-slate-500" />
                            </button>

                            {isPickerOpen && !disabledPicker && (
                                <div className="mt-3 rounded-xl border border-slate-200 bg-white p-4 shadow-xl space-y-4">
                                    <div className="flex items-center justify-between">
                                        <button
                                            type="button"
                                            onClick={() => setVisibleMonth(
                                                new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1),
                                            )}
                                            className="p-2 rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50"
                                        >
                                            <ChevronLeft size={16} />
                                        </button>

                                        <div className="text-sm font-semibold text-slate-800">
                                            {visibleMonth.toLocaleString([], { month: 'long', year: 'numeric' })}
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => setVisibleMonth(
                                                new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1),
                                            )}
                                            className="p-2 rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50"
                                        >
                                            <ChevronRight size={16} />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-7 gap-2">
                                        {WEEK_DAYS.map((day) => (
                                            <div key={day} className="text-center text-[11px] font-bold uppercase tracking-wide text-slate-400">
                                                {day}
                                            </div>
                                        ))}

                                        {calendarDays.map((date, index) => {
                                            if (!date) {
                                                return <div key={`empty-${index}`} className="h-9" />;
                                            }

                                            const isDisabled = isDateDisabled(date);
                                            const isSelected =
                                                isSameDay(date, selectedDate) && !isDisabled;

                                            return (
                                                <button
                                                    key={date.toISOString()}
                                                    type="button"
                                                    disabled={isDisabled}
                                                    onClick={() => updatePublishDate(date, selectedTime)}
                                                    className={`h-9 rounded-md text-sm border transition ${isDisabled
                                                        ? 'bg-slate-100 text-slate-300 border-slate-100 cursor-not-allowed'
                                                        : isSelected
                                                            ? 'bg-slate-900 text-white border-slate-900'
                                                        : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'
                                                        }`}
                                                >
                                                    {date.getDate()}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <div className="space-y-2">
                                        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Time</div>
                                        <div className="grid grid-cols-3 gap-2">
                                            <select
                                                value={selectedHour12}
                                                onChange={(e) =>
                                                    updatePublishDate(
                                                        selectedDate,
                                                        get24HourTime(
                                                            e.target.value,
                                                            selectedMinute,
                                                            selectedPeriod,
                                                        ),
                                                    )
                                                }
                                                className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none"
                                            >
                                                {HOUR_OPTIONS.map((hour) => (
                                                    <option
                                                        key={hour}
                                                        value={hour}
                                                        disabled={isHourDisabled(hour)}
                                                    >
                                                        {hour.padStart(2, '0')}
                                                    </option>
                                                ))}
                                            </select>

                                            <select
                                                value={selectedMinute}
                                                onChange={(e) =>
                                                    updatePublishDate(
                                                        selectedDate,
                                                        get24HourTime(
                                                            selectedHour12,
                                                            e.target.value,
                                                            selectedPeriod,
                                                        ),
                                                    )
                                                }
                                                className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none"
                                            >
                                                {MINUTE_OPTIONS.map((minute) => (
                                                    <option
                                                        key={minute}
                                                        value={minute}
                                                        disabled={isMinuteDisabled(minute)}
                                                    >
                                                        {minute}
                                                    </option>
                                                ))}
                                            </select>

                                            <select
                                                value={selectedPeriod}
                                                onChange={(e) =>
                                                    updatePublishDate(
                                                        selectedDate,
                                                        get24HourTime(
                                                            selectedHour12,
                                                            selectedMinute,
                                                            e.target.value as 'AM' | 'PM',
                                                        ),
                                                    )
                                                }
                                                className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none"
                                            >
                                                {PERIOD_OPTIONS.map((period) => (
                                                    <option
                                                        key={period}
                                                        value={period}
                                                        disabled={isPeriodDisabled(period)}
                                                    >
                                                        {period}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Author</label>
                            <input
                                {...register('author')}
                                placeholder="Enter Blog Author Name ...."
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none text-black text-sm"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                Category
                            </label>

                            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsCategoryModalOpen(true)}
                                        className="text-blue-600 text-sm hover:underline"
                                    >
                                        + Add New Category
                                    </button>
                                </div>

                                {categories.map((cat) => (
                                    <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={category.includes(cat.id)}
                                            onChange={() => {
                                                let updated;

                                                if (category.includes(cat.id)) {
                                                    updated = category.filter(id => id !== cat.id);
                                                } else {
                                                    updated = [...category, cat.id];
                                                }

                                                setValue('category', updated);
                                            }}
                                            className="w-4 h-4 accent-blue-600"
                                        />
                                        <span className="text-sm text-black">{cat.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl space-y-4 glass-card">
                    <h3 className="font-semibold text-white flex items-center gap-2">
                        Featured Image
                    </h3>

                    <div className="aspect-video glass-card flex flex-col items-center justify-center text-center">
                        {image ? (
                            <div className="relative w-full h-full group">
                                <img
                                    src={
                                        image?.startsWith('blob:')
                                            ? image
                                            : `${process.env.BACKEND_DOMAIN}/${image}`
                                    }
                                    alt="Selected"
                                    className="w-full h-full object-cover rounded-xl"
                                />

                                <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition flex items-center justify-center rounded-xl">
                                    <button
                                        type="button"
                                        onClick={handleRemoveImage}
                                        className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-full shadow-lg transition"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-white">Select Featured Image</p>
                        )}

                        <div className="flex gap-3 my-4">
                            <button
                                type="button"
                                onClick={() => {
                                    setMediaFor('feature');
                                    setIsUploadModalOpen(true);
                                }}
                                className="btn"
                            >
                                Select Image
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default BlogSidebar;
