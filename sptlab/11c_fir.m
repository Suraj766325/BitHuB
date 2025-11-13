clc;
clear all;
close all;
h=[1 2 3 4 3 2 1]; %symmetric impulse response assumed for linear phase FIR
M=length(h); %order of the filter
x=[ 1 2 3 4 5 6 7]; %input,keeping length same as the order of the filter, otherwise zero-padding is requiired
Lx=length(x);
x_shift= zeros(M,M); %creating null register to store different shifted versions of x i.e x(n-k)
disp('null register to store different  hifted versions of x');
x_shift
for i=1:M
    if i==1
        x_shift(i,1:M)=x(1:M)
    else
        x_shift(i,i:M)=x(1:M-i+1)
    end
end
    disp('register storing different shifted versions of x i.e x(n-k)')
    x_shift
    for i=1:M
        y(i,:)=h(i)*x_shift(i,:); %multiplying impulse response with different shifted versions of x i.e h(k)*x(n-k)
    end
    op=sum(y);
    subplot(4,1,3)%adding all h(k)*x(n-k) terms
    stem(op)
    title("FIR filter output")
    %comparing with convolution function
    conv1=conv(x,h);
    subplot(4,1,4)
    stem(conv1)
    subplot(4,1,1)
    stem(x)
    title("input x(n)")
    subplot(4,1,2)
    stem(h)
    title("impulse response h(n)" )
