Friction is a one-screen simulation that depicts a draggable Chemistry book on top of a fixed Physics book.  The main
part of the play area is the MagnifyingGlassNode, which shows the zoomed in part of the simulation.  Canvas is used to render
the atoms in attempt to improve performance.  The main property modeled by the simulation and depicted in the thermometer
is FrictionModel.vibrationAmplitudeProperty, which indicates how much the atoms are oscillating.  If an atom meets the threshold,
it shears off.

Model and screen coordinates are the same in this sim, so no model-view transform is needed.