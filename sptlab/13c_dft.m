clc;
clear;
close all;
x=[0,1,2,3];
N=length(x);
X_manual=zeros(1,N);
for k=0:N-1
    for n=0:N-1
        X_manual(k+1)=X_manual(k+1)+x(n+1)*exp((-1j*pi*k*n)/N);
    end
end
X_fft=fft(x,N);
disp('Input sequence x[n]');
disp(x);

disp('Dft computed manually');
disp(X_manual);

disp('DFT computed using MATLAB fft():');
disp(X_fft);

k=0:N-1;
subplot(2,1,1);
stem(k,abs(X_manual),'filled');
title('Magnitude Spectrum |X(k)|');
xlabel('k'); ylabel('|x(k)|');

subplot(2,1,2);
stem(k,angle(X_manual),'filled');
title('phase spectrum <X(k)');
xlabel('k'); ylabel('Phase (radians)')