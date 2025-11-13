clc; clear; close all;

fs = 1000;          % Sampling frequency (Hz)
fc_low = 100;       % Lowpass cutoff frequency (Hz)
fc_high = 200;      % Highpass cutoff frequency (Hz)
fc_band = [100 300];% Bandpass frequency range (Hz)
n = 4;              % Filter order

% --- Normalized cutoff frequencies (0 to 1) ---
Wn_low = fc_low / (fs/2);
Wn_high = fc_high / (fs/2);
Wn_band = fc_band / (fs/2);

% --- Design filters ---
[b_low, a_low] = butter(n, Wn_low, 'low');
[b_high, a_high] = butter(n, Wn_high, 'high');
[b_band, a_band] = butter(n, Wn_band, 'bandpass');

% --- Frequency response ---
[H_low, f] = freqz(b_low, a_low, 1024, fs);
[H_high, ~] = freqz(b_high, a_high, 1024, fs);
[H_band, ~] = freqz(b_band, a_band, 1024, fs);

% --- Plot magnitude responses ---
figure;
subplot(3,1,1);
plot(f, abs(H_low));
title('Butterworth Lowpass Filter');
xlabel('Frequency (Hz)'); ylabel('|H(f)|'); grid on;

subplot(3,1,2);
plot(f, abs(H_high));
title('Butterworth Highpass Filter');
xlabel('Frequency (Hz)'); ylabel('|H(f)|'); grid on;

subplot(3,1,3);
plot(f, abs(H_band));
title('Butterworth Bandpass Filter');
xlabel('Frequency (Hz)'); ylabel('|H(f)|'); grid on;

