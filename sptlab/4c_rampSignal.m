clc;
t=-10:1:10;
x=t.*(t>=0);
subplot(2,1,1);
plot(t,x,'--r');
xlabel('t');
ylabel('x(t)');
title("Ramp Signal");

subplot(2,1,2);
stem(t,x,'--g');
xlabel('t');
ylabel('x(t)');
title("Discrete Ramp Signal");

