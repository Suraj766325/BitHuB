clc;
t=-3:0.02:3j;
x=sin(2.*pi.*t);
subplot(2,1,1);
plot(t,x,'r');
xlabel('t');
ylabel('x(t)');
title("Sine Wave");

subplot(2,1,2);
stem(t,x,'g');
xlabel('t');
ylabel('x(t)');
title("Discrete Sine Wave");