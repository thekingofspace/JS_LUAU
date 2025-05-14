local net = require("@lune/net")
local serde = require("@lune/serde")

fs = require("@lune/fs")

local module = {}

local Actions = {}

local ActiveNet = nil

local function CheckNet()
	if ActiveNet == nil then
		ActiveNet = net.serve(8081, function(Req)
			local BodyData = serde.decode("json", Req.body)

			if Actions[BodyData.type] then
				local value = Actions[BodyData.type].Connection(BodyData.data)

				return {
						status = 200,
						body = serde.encode("json", value),
					}
			end

			return
		end)
	end
end

function module:Invoke(key:string, data, Callback)
	local payload = serde.encode("json", {
		type = key,
		data = data
	}, false)

	local response = net.request({
		url = "http://localhost:8080", 
		method = "POST",
		headers = { ["Content-Type"] = "application/json" },
		body = payload
	})

	local decoded = serde.decode("json", response.body)

	if Callback ~= nil then
		Callback(decoded)
	end
end

function module.On(CallbackID:string)
	CheckNet()
	local self = setmetatable({}, {})

	self.Connection = nil

	self.__index = self
	
	function self:Connect(Callback:() -> ())
		self.Connection = Callback

		Actions[CallbackID] = self
	end

	function self:Discconnect(Callback:() -> ())
		Actions[CallbackID] = nil
	end

	return self
end

return module