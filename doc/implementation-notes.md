Friction is a one-screen simulation that depicts a draggable Chemistry book on top of a fixed Physics book.  The main
part of the play area is the MagnifierNode, which shows the zoomed in part of the simulation.  Canvas is used to render
the atoms in attempt to improve performance.  The main property modeled by the simulation and depicted in the thermometer
is FrictionModel.amplitudeProperty, which indicates how much the atoms are oscillating.  If an atom meets the threshold,
it evaporates.