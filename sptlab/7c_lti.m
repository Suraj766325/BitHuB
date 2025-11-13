% %%experiment 3 : LTI testing
% %% Part 1 Linearity
% clear
% close all
% clc
% 
% % x1=[1,2,3,4,5]; %input 1
% % x2=[-2,3,2,4,1]; %input 2
% % n=[0,1,2,3,4]; %samples or time sequence
% % a1 = 2;
% % a2 = 3;
% % 
% % %% Liniearity testing for system one : y=x^2(n)
% % y1 = x1.^2; % output due to input x1
% % y2 = x2.^2; % output due to input x2
% % y3 = (a1*x1+a2*x2).^2; % output due to linear combinations of input
% % y = a1*y1+a2*y2; % sum of weighted outputs
% % 
% % if y==y3
% %     disp("The system is linear")
% % else
% %     disp("the system is non-linear")
% % end   
% 
% 
% %Liniearity testing for system 2 : y=x^2(n)
% x1=ones(1,16); %input 1
% x2=ones(1,16); %input 2
% n=0:16; %samples or time sequence
% a1 = 2;
% a2 = 3;
% 
% for i=1:4
%     ti=n(i).^2;
%     y1(i)=x1(ti);
%     y2(i)=x2(ti);
%     y3(i)=a1*x1(ti)+a2*x2(ti);
%     y(i+1)=a1*y1(i)+a2*(y2(i));
% end
% 
% y1 = x1.^2; % output due to input x1
% y2 = x2.^2; % output due to input x2
% y3 = (a1*x1+a2*x2).^2; % output due to linear combinations of input
% y = a1*y1+a2*y2; % sum of weighted outputs
% if y==y3
%     disp("The system is linear")
% else
%     disp("the system is non-linear")
% end  
% 
% %%% part-2 Time Shifting
% n=-10:10;
% for i=1:length(n)
%     if n>0 & n<5
%         x(i)=n(i);
%     else
%         x(i)=0;
%     end
% end

%% Experiment 3: LTI Testing

clear;
close all;
clc;

%% -------------------------------
%% Part 1: Linearity Testing
%% -------------------------------

% System: y[n] = x[n]^2
% Define two input signals x1 and x2
x1 = [1, 2, 3, 4, 5]; 
x2 = [-2, 3, 2, 4, 1]; 
n = 0:4; % time index
a1 = 2;
a2 = 3;

% Compute outputs
y1 = x1.^2;               % Output for x1
y2 = x2.^2;               % Output for x2
y_combined = (a1*x1 + a2*x2).^2;  % Output of combined input
y_weighted = a1*y1 + a2*y2;       % Weighted sum of outputs

% Linearity check
if isequal(y_combined, y_weighted)
    disp('System y[n] = x[n]^2 is LINEAR');
else
    disp('System y[n] = x[n]^2 is NON-LINEAR');
end

%% -------------------------------
%% Part 2: Time Shifting
%% -------------------------------

% Define input signal x[n]
n = -10:10;
x = zeros(1, length(n));
for i = 1:length(n)
    if n(i) > 0 && n(i) < 5
        x(i) = n(i);  % example signal: x[n] = n for 0 < n < 5
    else
        x(i) = 0;
    end
end

% Plot original signal
figure;
stem(n, x, 'filled');
title('Original Signal x[n]');
xlabel('n'); ylabel('x[n]');
grid on;

% Time Shift: x[n - 2]
shift_amount = 2;
x_shifted = zeros(1, length(n));

for i = 1:length(n)
    idx = find(n == (n(i) - shift_amount));
    if ~isempty(idx)
        x_shifted(i) = x(idx);
    end
end

% Plot shifted signal
figure;
stem(n, x_shifted, 'filled');
title(['Time-Shifted Signal x[n - ', num2str(shift_amount), ']']);
xlabel('n'); ylabel('x[n - k]');
grid on;

%% -------------------------------
%% Part 3: Time Invariance Testing
%% -------------------------------

% System: y[n] = x[n]^2 (same as Part 1)
% We'll test if the system is time-invariant

% Step 1: Define input signal again
x = zeros(1, length(n));
for i = 1:length(n)
    if n(i) > 0 && n(i) < 5
        x(i) = n(i);
    else
        x(i) = 0;
    end
end

% Step 2: Apply system to original input
y_original = x.^2;

% Step 3: Apply time shift to input: x[n - k]
k = 2;  % shift amount
x_shifted = zeros(1, length(n));
for i = 1:length(n)
    idx = find(n == (n(i) - k));
    if ~isempty(idx)
        x_shifted(i) = x(idx);
    end
end

% Step 4: Apply system to shifted input
y_shifted_input = x_shifted.^2;

% Step 5: Shift the original output: y[n - k]
y_shifted_output = zeros(1, length(n));
for i = 1:length(n)
    idx = find(n == (n(i) - k));
    if ~isempty(idx)
        y_shifted_output(i) = y_original(idx);
    end
end

% Step 6: Compare
if isequal(y_shifted_input, y_shifted_output)
    disp('The system is TIME INVARIANT');
else
    disp('The system is NOT TIME INVARIANT');
end

% Plotting all results
figure;
subplot(3,1,1);
stem(n, y_original, 'filled');
title('Output y[n] = x[n]^2');
xlabel('n'); ylabel('y[n]');

subplot(3,1,2);
stem(n, y_shifted_input, 'filled');
title('System output of shifted input: y1[n] = (x[n - k])^2');

subplot(3,1,3);
stem(n, y_shifted_output, 'filled');
title('Shifted output: y2[n] = y[n - k]');
xlabel('n'); ylabel('y[n - k]');
