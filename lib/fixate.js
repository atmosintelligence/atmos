const TAG = /^\s*\[FIXATE\]\s*/i;

export const isFixated = title => TAG.test(String(title ?? ''));

export const cleanTitle = title => String(title ?? '').replace(TAG, '').trim();
