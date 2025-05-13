local Js_Handler = require("./Modules/Invoke")

local task = require("@lune/task")

task.wait(1)

local Signal = Js_Handler.On("Test")

Signal:Connect(function(Data)
    print("RAN")
end)

Js_Handler:Invoke("Post", "Hello", function()
     print("Reg Compl")
end)