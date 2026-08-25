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

const BlogSidebar = ({ register, publishDate, categories, category, setValue, image, handleRemoveImage, setIsCategoryModalOpen, setIsUploadModalOpen, setMediaFor, globalStatus, blogId, authors }: BlogSidebarProps) => {
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
            <div className="space-y-6 sticky top-4">
                <div className="rounded-[24px] border border-[var(--border)] bg-[var(--bg-surface)] p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
                    <div className="border-b border-[var(--border)] pb-5">
                        <h3 className="text-xl font-semibold text-[var(--text-strong)]">
                            Publishing Settings
                        </h3>
                        <p className="mt-2 text-sm leading-7 text-[var(--text-muted)]">
                            Control the publish status, schedule, author details, and category assignment.
                        </p>
                    </div>

                    <div className="mt-6 space-y-5">
                        <div className="space-y-2">
                            <label htmlFor="global-status" className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--text-subtle)]">Global Status</label>
                            <select
                                id="global-status"
                                {...register('globalStatus')}
                                className="w-full rounded-[18px] border border-[var(--border)] bg-[var(--bg-inset)] px-4 py-3 text-sm text-[var(--text-strong)] focus:border-[var(--accent)] focus:outline-none"
                            >
                                <option value="draft">Draft</option>
                                <option value="future">Scheduled</option>
                                <option value="publish">Published</option>
                            </select>
                        </div>

                        <div className="space-y-2" ref={pickerRef}>
                            <label htmlFor="publish-date-trigger" className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--text-subtle)]">Publish Date</label>
                            <input type="hidden" {...hiddenPublishDateRegister} />

                            <button
                                id="publish-date-trigger"
                                type="button"
                                disabled={disabledPicker}
                                onClick={() => setIsPickerOpen((prev) => !prev)}
                                className={`flex w-full items-center justify-between gap-3 rounded-[18px] border px-4 py-3 text-sm ${disabledPicker
                                    ? 'cursor-not-allowed border-[var(--border)] bg-[var(--bg-selected)] text-[#2a476f]'
                                    : 'border-[var(--border)] bg-[var(--bg-inset)] text-[var(--text-strong)]'
                                    }`}
                            >
                                <span className="flex items-center gap-2">
                                    <Calendar size={16} className="text-[var(--text-subtle)]" />
                                    <span>{formatDisplayValue(publishDate)}</span>
                                </span>
                                <Clock3 size={16} className="text-[var(--text-subtle)]" />
                            </button>

                            {isPickerOpen && !disabledPicker && (
                                <div className="mt-3 space-y-4 rounded-[20px] border border-[var(--border)] bg-[var(--bg-inset)] p-4 shadow-[0_18px_40px_rgba(0,0,0,0.3)]">
                                    <div className="flex items-center justify-between">
                                        <button
                                            type="button"
                                            onClick={() => setVisibleMonth(
                                                new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1),
                                            )}
                                            className="rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] p-2 text-[var(--text)] transition hover:border-[var(--accent)] hover:bg-[var(--bg-selected)]"
                                        >
                                            <ChevronLeft size={16} />
                                        </button>

                                        <div className="text-sm font-semibold text-[var(--text-strong)]">
                                            {visibleMonth.toLocaleString([], { month: 'long', year: 'numeric' })}
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => setVisibleMonth(
                                                new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1),
                                            )}
                                            className="rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] p-2 text-[var(--text)] transition hover:border-[var(--accent)] hover:bg-[var(--bg-selected)]"
                                        >
                                            <ChevronRight size={16} />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-7 gap-2">
                                        {WEEK_DAYS.map((day) => (
                                            <div key={day} className="text-center text-[11px] font-bold uppercase tracking-wide text-[var(--text-faint)]">
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
                                                    className={`h-9 rounded-md border text-sm transition ${isDisabled
                                                        ? 'cursor-not-allowed border-[var(--border)] bg-[var(--bg-selected)] text-[#2a476f]'
                                                        : isSelected
                                                            ? 'border-[var(--accent)] bg-[var(--accent)] text-[#ffffff]'
                                                            : 'border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text)] hover:border-[var(--accent)] hover:bg-[var(--bg-selected)]'
                                                        }`}
                                                >
                                                    {date.getDate()}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <div className="space-y-2">
                                        <div className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--text-subtle)]">Time</div>
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
                                                className="rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-strong)] focus:border-[var(--accent)] focus:outline-none"
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
                                                className="rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-strong)] focus:border-[var(--accent)] focus:outline-none"
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
                                                className="rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-strong)] focus:border-[var(--accent)] focus:outline-none"
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
                            <label htmlFor="blog-author" className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--text-subtle)]">Author</label>
                            <select
                                id="blog-author"
                                {...register('author')}
                                className="w-full rounded-[18px] border border-[var(--border)] bg-[var(--bg-inset)] px-4 py-3 text-sm text-[var(--text-strong)] placeholder:text-[var(--text-faint)] focus:border-[var(--accent)] focus:outline-none"
                            >
                                <option value="">Select Author</option>
                                {authors.map((author) => (
                                    <option key={author.id} value={author.name}>
                                        {author.name}
                                    </option>
                                ))}
                            </select>
                            {authors.length === 0 && (
                                <p className="text-xs text-[var(--text-muted)]">
                                    No authors available.
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--text-subtle)]">
                                Category
                            </p>

                            <div className="max-h-52 space-y-2 overflow-y-auto rounded-[20px] border border-[var(--border)] bg-[var(--bg-inset)] p-4">
                                <div className="pb-2">
                                    <button
                                        id="add-category-trigger"
                                        type="button"
                                        onClick={() => setIsCategoryModalOpen(true)}
                                        className="rounded-full border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-1.5 text-sm text-[var(--accent)] transition hover:border-[var(--status-green-text)] hover:text-[var(--status-green-text)]"
                                    >
                                        + Add New Category
                                    </button>
                                </div>

                                {categories.map((cat) => (
                                    <label key={cat.id} className="flex cursor-pointer items-center gap-3 rounded-xl px-2 py-2 transition hover:bg-black/[0.03]">
                                        <input
                                            id={`sidebar-category-${cat.id}`}
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
                                            className="h-4 w-4 accent-[#bce2e6]"
                                        />
                                        <span className="text-sm text-[var(--text)]">{cat.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="rounded-[24px] border border-[var(--border)] bg-[var(--bg-surface)] p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06)] relative">
                    <div className="border-b border-[var(--border)] pb-5">
                        <h3 className="text-xl font-semibold text-[var(--text-strong)]">
                            Featured Image
                        </h3>
                        <p className="mt-2 text-sm leading-7 text-[var(--text-muted)]">
                            Choose the main image that represents this blog in listings and previews.
                        </p>
                    </div>

                    <div className="mt-6 aspect-video rounded-[22px] border border-dashed border-[var(--border)] bg-[var(--bg-inset)] p-4">
                        {image ? (
                            <div className="group relative h-full w-full overflow-hidden rounded-[18px]">
                                <img
                                    src={
                                        image?.startsWith('blob:')
                                            ? image
                                            : `${process.env.BACKEND_DOMAIN}/${image}`
                                    }
                                    alt="Selected"
                                    className="h-full w-full rounded-[18px] object-cover"
                                />

                                <div className="absolute inset-0 flex items-center justify-center rounded-[18px] bg-[#202124]/35 opacity-0 transition group-hover:opacity-100">
                                    <button
                                        type="button"
                                        onClick={handleRemoveImage}
                                        className="bg-red-500 hover:bg-red-600 text-[var(--text-strong)] p-3 rounded-full shadow-lg transition"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex h-full flex-col items-center justify-center text-center">
                                <p className="text-base font-medium text-[var(--text-strong)]">Select Featured Image</p>
                                <p className="mt-2 max-w-[240px] text-sm leading-6 text-[var(--text-muted)]">
                                    Upload or choose an existing media asset for the article cover.
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="mt-5 flex gap-3">
                        <button
                            type="button"
                            onClick={() => {
                                setMediaFor('feature');
                                setIsUploadModalOpen(true);
                            }}
                            className="inline-flex items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--bg-inset)] px-4 py-2.5 text-sm font-medium text-[var(--text-strong)] transition hover:border-[var(--accent)] hover:bg-[var(--bg-selected)]"
                        >
                            Select Image
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default BlogSidebar;
