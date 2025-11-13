clc;
clear all;
close all;

% Given numerator and denominator
n = [0 1 0];           % Numerator coefficients
d = [1 -1.5 0.5];      % Denominator coefficients

% Partial fraction expansion
[r, p, k] = residuez(n, d);

%% i) For ROC |z| > 1  (Causal sequence)
if isempty(k)
    izt1 = 'x(n) = ';
else
    izt1 = 'x(n) = k*delta(n)';
end

for i = 1:length(p)
    izt1 = strcat(izt1, sprintf(' + (%.3f)*(%.3f)^n*u(n)', r(i), p(i)));
end

disp('The IZT for ROC |z| > 1 (causal):')
disp(izt1)

%% ii) For ROC |z| < 0.5  (Anticausal sequence)
if isempty(k)
    izt2 = 'x(n) = ';
else
    izt2 = 'x(n) = k*delta(n)';
end

for i = 1:length(p)
    izt2 = strcat(izt2, sprintf(' + (%.3f)*(%.3f)^n*u(-n-1)', r(i), p(i)));
end

disp('The IZT for ROC |z| < 0.5 (anticausal):')
disp(izt2)

%% iii) For ROC 0.5 < |z| < 1  (Two-sided sequence)
if isempty(k)
    izt3 = 'x(n) = ';
else
    izt3 = 'x(n) = k*delta(n)';
end

for i = 1:length(p)
    if abs(p(i)) > 0.5 && abs(p(i)) < 1
        % Inside ROC → causal part
        izt3 = strcat(izt3, sprintf(' + (%.3f)*(%.3f)^n*u(n)', r(i), p(i)));
    else
        % Outside ROC → anticausal part
        izt3 = strcat(izt3, sprintf(' + (%.3f)*(%.3f)^n*u(-n-1)', r(i), p(i)));
    end
end

disp('The IZT for ROC 0.5 < |z| < 1 (two-sided):')
disp(izt3)
