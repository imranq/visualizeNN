import numpy
import matplotlib.pyplot as plt
import sys
import scipy.special
import scipy.ndimage
import mnist
import json

class neuralnetwork:
	def __init__(self,input_nodes,hidden_nodes,output_nodes,learning_rate):
		self.inodes = input_nodes
		self.hnodes = hidden_nodes
		self.onodes = output_nodes

		self.lr = learning_rate
		self.wih = (numpy.random.rand(self.hnodes, self.inodes))-0.5 #100x784
		self.who = (numpy.random.rand(self.onodes, self.hnodes))-0.5 #10x100		
		print(self.who)
		# self.wih = numpy.random.normal(0.0, pow(self.hnodes, -0.5), (self.hnodes, self.inodes)) #
		# self.who = numpy.random.normal(0.0, pow(self.onodes, -0.5), (self.onodes, self.hnodes))

		self.activation_function = lambda x:  scipy.special.expit(x)
		self.reverse_activation_function = lambda x:  scipy.special.logit(x)


		pass

	def train(self, inputs, targets):

		inputs = numpy.array(inputs, ndmin=2).T #784x1
		targets = numpy.array(targets, ndmin=2).T #10x1

		# print(inputs.shape)
		# print(self.wih.shape)
		#calculate signals into hidden layer
		hidden_inputs = numpy.dot(self.wih, inputs) # (100x784)*(784x1) = 100x1
		#calculate the signals emerging from hidden layer 
		hidden_outputs = self.activation_function(hidden_inputs) # 100x1
		#calculate signals into final output layer

		final_inputs = numpy.dot(self.who, hidden_outputs) #(10x100)*(100x1) = 10x1
		#calculate the signals emerging from final output layer 
		final_outputs = self.activation_function(final_inputs) #10x1
		
		#error in the process
		output_errors = targets - final_outputs # 10x1 - 10x1 = 10x1
		hidden_errors = numpy.dot(self.who.T, output_errors) # 100x10*10x1 = 100x1
		#training process
		self.who += self.lr*numpy.dot((output_errors)*final_outputs*(1.0 - final_outputs),numpy.transpose(hidden_outputs)) # (10x1*10x1*10x1)*(1x100) = (10x1)*(1x100) = 10x100
		self.wih += self.lr * numpy.dot((hidden_errors * hidden_outputs * (1.0 - hidden_outputs)), numpy.transpose(inputs)) # (100x1*100x1*100x1)*(1x784) = (100x1)*(1x784) = 100x784
		pass

	def query(self, inputs):
		#calculate signals into hidden layer 
		hidden_inputs = numpy.dot(self.wih, inputs) 
		#calculate the signals emerging from hidden layer 
		hidden_outputs = self.activation_function(hidden_inputs) 
		#calculate signals into final output layer 
		final_inputs = numpy.dot(self.who, hidden_outputs) 
		#calculate the signals emerging from final output layer 
		final_outputs = self.activation_function(final_inputs)
		
		return final_outputs
		pass

	def reverseQuery(self, targets):
		targets = numpy.array(targets, ndmin=2).T
		# print(self.wih.T.shape)
		# print(targets.shape)
		final_inputs = self.reverse_activation_function(targets)
		hidden_outputs = numpy.dot(self.who.T, final_inputs)
		
		hidden_outputs -= numpy.min(hidden_outputs)
		hidden_outputs /= numpy.max(hidden_outputs)
		hidden_outputs *= 0.98
		hidden_outputs += 0.01

		hidden_inputs = self.reverse_activation_function(hidden_outputs)

		input_layer = numpy.dot(self.wih.T, hidden_inputs)

		input_layer -= numpy.min(input_layer)
		input_layer /= numpy.max(input_layer)
		input_layer *= 0.98
		input_layer += 0.01


		return input_layer

		pass

	def reverseQueryImage(self, targets):
		inputs = self.reverseQuery(targets)

		# inputs = (inputs-0.01)*255/0.99
		image_array = numpy.asfarray(inputs).reshape((28,28))
		
		plt.imshow(image_array, cmap='Greys', interpolation='None')		
		plt.show()
		pass



def testTraining():
	nn = neuralnetwork(784,100,10,0.2)
	with open('mnist.js', 'r') as myfile:
	    # print(myfile.read().replace('\n', ''))
	    data = json.loads(myfile.read().replace('\n', '').replace("var mnist = ", ""))

	# print(data)

	for d in data[0:900]:
		# print(d)
		inputs = numpy.asfarray(d["mnist"]) 
		# create the target output values (all 0.01, except the desired label which is 0.99)
		targets = numpy.zeros(10) + 0.01
		# all_values[0] is the target label for this record
		targets[d["digit"]] = 0.99
		nn.train(inputs, targets)

	scorecard = []

	for d in data[501:600]:
		outputs = nn.query(numpy.asfarray(d["mnist"]))
		# the index of the highest value corresponds to the label
		label = numpy.argmax(outputs)
	    # append correct or incorrect to list
		if (label == d["digit"]):
	        # network's answer matches correct answer, add 1 to scorecard
			scorecard.append(1)
		else:
	        # network's answer doesn't match correct answer, add 0 to scorecard
			scorecard.append(0)
			pass    
		pass

	scorecard = numpy.asarray(scorecard)
	print ("performance = ", scorecard.sum() / scorecard.size)


def loadJSTraining():
	training_data_file = open("mnist_train_10000.csv", 'r')
	training_data_list = training_data_file.readlines()
	training_data_file.close()
	result = []

	for record in training_data_list[1:5000]:
		all_values = record.split(",")
		# print(record)
		entry = {	"digit": int(all_values[0]),
					"mnist": ((numpy.asfarray(all_values[1:]) / 255.0 * 0.99) + 0.01).tolist()
					}
		result.append(entry)
		pass

	with open('mnist.js', 'w') as outfile:
		json.dump(result, outfile, sort_keys=True, indent=4)

loadJSTraining()

# for e in range(epochs):
#     # go through all records in the training data set
# 	for record in training_data_list[1:10000]:
# 		# print(record)
#         # split the record by the ',' commas
# 		all_values = record.split(',')
# 		# scale and shift the inputs
# 		inputs = (numpy.asfarray(all_values[1:]) / 255.0 * 0.99) + 0.01
# 		# create the target output values (all 0.01, except the desired label which is 0.99)
# 		targets = numpy.zeros(10) + 0.01
# 		# all_values[0] is the target label for this record
# 		targets[int(all_values[0])] = 0.99
# 		nn.train(inputs, targets)
# 		pass
# 	pass

# test_data_file = open("mnist_dataset/mnist_test_custom.csv", 'r')
# test_data_list = test_data_file.readlines()
# test_data_file.close()

# scorecard = []

# # go through all the records in the test data set
# for record in test_data_list:
#     # split the record by the ',' commas
#     all_values = record.split(',')
#     # correct answer is first value
#     correct_label = int(all_values[0])
#     # scale and shift the inputs
#     inputs = (numpy.asfarray(all_values[1:]) / 255.0 * 0.99) + 0.01
#     # query the network
#     outputs = nn.query(inputs)
#     # the index of the highest value corresponds to the label
#     label = numpy.argmax(outputs)
#     # append correct or incorrect to list
#     if (label == correct_label):
#         # network's answer matches correct answer, add 1 to scorecard
#         scorecard.append(1)
#     else:
#         # network's answer doesn't match correct answer, add 0 to scorecard
#         scorecard.append(0)
#         pass    
#     pass

# scorecard_array = numpy.asarray(scorecard)
# print ("performance = ", scorecard_array.sum() / scorecard_array.size)
