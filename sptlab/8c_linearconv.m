clear all;
close all;
clc

% Input sequences
A = [1 2 1 2];
B = [2 1 2 3];

% Lengths of sequences
L1 = length(A);
L2 = length(B);

% Starting indices (time indices)
nA = [-1 0 1 2];   % Starting index of A
nB = [0 1 2 3];    % Starting index of B

n1 = nA(1);        % Starting index of A
n2 = nB(1);        % Starting index of B

% Initialize output sequence for manual convolution
Y = zeros(1, L1 + L2 - 1);

% Manual convolution implementation
for i = 1:L1
    for j = 1:L2
        Y(i + j - 1) = Y(i + j - 1) + A(i) * B(j);
    end
end

% Calculate the time indices for the output sequence
nY = n1 + n2 : n1 + n2 + length(Y) - 1;

% Display output
disp('Output sequence Y:');
disp(Y);

% Plotting sequences
figure;

subplot(4,1,1);
stem(nA, A, 'filled');
title('First sequence A[n]');
xlabel('n');
ylabel('Amplitude');

subplot(4,1,2);
stem(nB, B, 'filled');
title('Second sequence B[n]');
xlabel('n');
ylabel('Amplitude');

subplot(4,1,3);
stem(nY, Y, 'filled');
title('Convolution output Y[n]');
xlabel('n');
ylabel('Amplitude');

% Comparison with inbuilt function
Y1 = conv(A,B);
subplot(4,1,4)
stem(Y1)
title('Comparision with inbuilt function conv(x,y)')

