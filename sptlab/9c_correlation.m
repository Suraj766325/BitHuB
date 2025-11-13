clc; 
clear;
close all;
x=input('Enter the first sequence x: ');
y=input('Enter the second sequence y: ');

y_flipped=fliplr(y);
Rxy=conv(x,y_flipped);
lags_cross = -(length(y)-1):(length(x)-1);

x_flipped=fliplr(x);
Rxx=conv(x,x_flipped);
lags_auto = -(length(x)-1):(length(x)-1);

disp("Cross Correlation Rxy: ");
disp(Rxy);

disp("Auto Correlation Rxx: ");
disp(Rxx);

subplot(2,1,1)
stem(lags_cross,Rxy);
title('Cross Correlation R_{xy}[k]');
xlabel('Lag K');ylabel('R_{xy}[k]');grid on;

subplot(2,1,2)
stem(lags_auto,Rxx);
title('Auto Correlation R_{xx}[k]');
xlabel('Lag K');ylabel('R_{xx}[k]');grid on;